import { applySafeFixes, detectIssues } from '../../../lib/feed-cleaner.js';
import { ensureSchema, getJobForUser, getSession, parseJobId, send, sql } from '../_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const jobId = parseJobId(req);
  if (!jobId) return send(res, 400, { error: 'jobId missing in route' });

  await ensureSchema();

  const job = await getJobForUser(session.userId, jobId);
  if (!job) return send(res, 404, { error: 'Job not found' });

  const rows = Array.isArray(job.original_rows) ? job.original_rows : [];

  await sql`UPDATE feed_jobs SET status = 'processing', updated_at = NOW() WHERE id = ${jobId}`;

  const issues = detectIssues(rows);
  const { cleanedRows } = applySafeFixes(rows, issues);

  await sql`DELETE FROM feed_issues WHERE job_id = ${jobId}`;
  for (const issue of issues) {
    await sql`
      INSERT INTO feed_issues (id, job_id, row_index, item_id, field_name, severity, rule_code, message, suggested_fix, is_safe_fix, status)
      VALUES (
        ${issue.id}, ${jobId}, ${issue.rowIndex}, ${issue.itemId}, ${issue.fieldName}, ${issue.severity},
        ${issue.ruleCode}, ${issue.message}, ${JSON.stringify(issue.suggestedFix)}::jsonb, ${issue.isSafeFix}, 'open'
      )
    `;
  }

  await sql`DELETE FROM feed_rule_runs WHERE job_id = ${jobId}`;
  const grouped = issues.reduce((acc: Record<string, number>, issue: any) => {
    acc[issue.ruleCode] = (acc[issue.ruleCode] || 0) + 1;
    return acc;
  }, {});
  for (const [ruleCode, count] of Object.entries(grouped)) {
    await sql`
      INSERT INTO feed_rule_runs (id, job_id, rule_code, status, issues_found, started_at, completed_at, metadata)
      VALUES (gen_random_uuid()::text, ${jobId}, ${ruleCode}, 'completed', ${count}, NOW(), NOW(), '{}'::jsonb)
    `;
  }

  const summary = {
    totalIssues: issues.length,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    safeFixableCount: issues.filter((i) => i.isSafeFix).length,
  };

  await sql`
    UPDATE feed_jobs
    SET status = 'completed',
        processed_rows = ${rows.length},
        cleaned_rows = ${JSON.stringify(cleanedRows)}::jsonb,
        summary = ${JSON.stringify(summary)}::jsonb,
        updated_at = NOW()
    WHERE id = ${jobId}
  `;

  return send(res, 200, { jobId, status: 'completed', summary });
}
