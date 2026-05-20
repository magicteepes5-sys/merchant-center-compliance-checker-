import { randomUUID } from 'node:crypto';
import { applySafeFixes, detectIssues, normalizeRows, rowsToCsv } from '../lib/feed-cleaner.js';
import { ensureSchema, sql } from '../lib/db.js';
import { getSession, send } from './_shared.js';

function getAction(req: any): string {
  const q = req.query?.action;
  if (typeof q === 'string' && q) return q;
  return String(req.body?.action || '');
}

function getJobId(req: any): string {
  const q = req.query?.jobId;
  if (typeof q === 'string' && q) return q;
  return String(req.body?.jobId || '');
}

async function requireJob(userId: string, jobId: string) {
  const rows = await sql`SELECT * FROM feed_jobs WHERE id = ${jobId} AND user_id = ${userId} LIMIT 1`;
  return rows[0] || null;
}

export default async function handler(req: any, res: any) {
  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  await ensureSchema();

  const action = getAction(req);
  const method = req.method;

  if (method === 'POST' && action === 'upload') {
    const rows = normalizeRows(req.body?.rows);
    if (!rows.length) return send(res, 400, { error: 'rows must be a non-empty array' });

    const jobId = randomUUID();
    await sql`
      INSERT INTO feed_jobs (id, user_id, status, total_rows, processed_rows, original_rows, cleaned_rows, input_format)
      VALUES (${jobId}, ${session.userId}, 'uploaded', ${rows.length}, 0, ${JSON.stringify(rows)}::jsonb, ${JSON.stringify(rows)}::jsonb, 'json')
    `;
    return send(res, 201, { jobId, status: 'uploaded', totalRows: rows.length });
  }

  if (method === 'POST' && action === 'process') {
    const jobId = getJobId(req);
    if (!jobId) return send(res, 400, { error: 'jobId required' });
    const job = await requireJob(session.userId, jobId);
    if (!job) return send(res, 404, { error: 'Job not found' });

    const rows = Array.isArray(job.original_rows) ? job.original_rows : [];
    await sql`UPDATE feed_jobs SET status = 'processing', updated_at = NOW() WHERE id = ${jobId}`;

    const issues = detectIssues(rows);
    const { cleanedRows } = applySafeFixes(rows, issues);

    await sql`DELETE FROM feed_issues WHERE job_id = ${jobId}`;
    for (const issue of issues) {
      await sql`
        INSERT INTO feed_issues (id, job_id, row_index, item_id, field_name, severity, rule_code, message, suggested_fix, is_safe_fix, status)
        VALUES (${issue.id}, ${jobId}, ${issue.rowIndex}, ${issue.itemId}, ${issue.fieldName}, ${issue.severity}, ${issue.ruleCode}, ${issue.message}, ${JSON.stringify(issue.suggestedFix)}::jsonb, ${issue.isSafeFix}, 'open')
      `;
    }

    await sql`DELETE FROM feed_rule_runs WHERE job_id = ${jobId}`;
    const grouped = issues.reduce((acc: Record<string, number>, i: any) => {
      acc[i.ruleCode] = (acc[i.ruleCode] || 0) + 1;
      return acc;
    }, {});
    for (const [ruleCode, count] of Object.entries(grouped)) {
      await sql`INSERT INTO feed_rule_runs (id, job_id, rule_code, status, issues_found, started_at, completed_at, metadata)
      VALUES (gen_random_uuid()::text, ${jobId}, ${ruleCode}, 'completed', ${count}, NOW(), NOW(), '{}'::jsonb)`;
    }

    const summary = {
      totalIssues: issues.length,
      errorCount: issues.filter((i) => i.severity === 'error').length,
      warningCount: issues.filter((i) => i.severity === 'warning').length,
      safeFixableCount: issues.filter((i) => i.isSafeFix).length,
    };

    await sql`UPDATE feed_jobs
      SET status='completed', processed_rows=${rows.length}, cleaned_rows=${JSON.stringify(cleanedRows)}::jsonb, summary=${JSON.stringify(summary)}::jsonb, updated_at=NOW()
      WHERE id=${jobId}`;

    return send(res, 200, { jobId, status: 'completed', summary });
  }

  if (method === 'GET' && action === 'issues') {
    const jobId = getJobId(req);
    if (!jobId) return send(res, 400, { error: 'jobId required' });
    const job = await requireJob(session.userId, jobId);
    if (!job) return send(res, 404, { error: 'Job not found' });

    const issues = await sql`SELECT id, row_index, item_id, field_name, severity, rule_code, message, suggested_fix, is_safe_fix, status, created_at
      FROM feed_issues WHERE job_id=${jobId} ORDER BY row_index ASC, created_at ASC`;
    return send(res, 200, { jobId, issues });
  }

  if (method === 'POST' && action === 'apply-safe-fixes') {
    const jobId = getJobId(req);
    if (!jobId) return send(res, 400, { error: 'jobId required' });
    const job = await requireJob(session.userId, jobId);
    if (!job) return send(res, 404, { error: 'Job not found' });

    const issues = await sql`SELECT * FROM feed_issues WHERE job_id = ${jobId} ORDER BY created_at ASC`;
    const { cleanedRows, appliedCount } = applySafeFixes(Array.isArray(job.cleaned_rows) ? job.cleaned_rows : [], issues as any);

    await sql`UPDATE feed_jobs SET cleaned_rows=${JSON.stringify(cleanedRows)}::jsonb, safe_fixes_applied=COALESCE(safe_fixes_applied,0)+${appliedCount}, updated_at=NOW() WHERE id=${jobId}`;
    await sql`UPDATE feed_issues SET status = CASE WHEN is_safe_fix = TRUE THEN 'fixed' ELSE status END WHERE job_id = ${jobId}`;

    return send(res, 200, { jobId, appliedCount });
  }

  if (method === 'GET' && action === 'download-cleaned') {
    const jobId = getJobId(req);
    if (!jobId) return send(res, 400, { error: 'jobId required' });
    const job = await requireJob(session.userId, jobId);
    if (!job) return send(res, 404, { error: 'Job not found' });

    const csv = rowsToCsv(Array.isArray(job.cleaned_rows) ? job.cleaned_rows : []);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cleaned-${jobId}.csv"`);
    return res.status(200).send(csv);
  }

  if (method === 'GET' && action === 'report') {
    const jobId = getJobId(req);
    if (!jobId) return send(res, 400, { error: 'jobId required' });
    const job = await requireJob(session.userId, jobId);
    if (!job) return send(res, 404, { error: 'Job not found' });

    const issueCounts = await sql`SELECT severity, COUNT(*)::int AS count FROM feed_issues WHERE job_id=${jobId} GROUP BY severity`;
    const ruleRuns = await sql`SELECT rule_code, status, issues_found, started_at, completed_at FROM feed_rule_runs WHERE job_id=${jobId} ORDER BY completed_at DESC NULLS LAST`;
    return send(res, 200, {
      job: {
        id: job.id,
        status: job.status,
        totalRows: job.total_rows,
        processedRows: job.processed_rows,
        safeFixesApplied: job.safe_fixes_applied,
        summary: job.summary || null,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
      issueCounts,
      ruleRuns,
    });
  }

  if (method === 'GET' && action === 'status') {
    const jobId = getJobId(req);
    if (!jobId) return send(res, 400, { error: 'jobId required' });
    const job = await requireJob(session.userId, jobId);
    if (!job) return send(res, 404, { error: 'Job not found' });
    return send(res, 200, {
      job: {
        id: job.id,
        status: job.status,
        totalRows: job.total_rows,
        processedRows: job.processed_rows,
        safeFixesApplied: job.safe_fixes_applied,
        summary: job.summary || null,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
    });
  }

  return send(res, 400, { error: 'Unsupported action or method' });
}
