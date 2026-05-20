import { ensureSchema, getSession, parseJobId, send, sql } from '../_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const jobId = parseJobId(req);
  if (!jobId) return send(res, 400, { error: 'jobId missing in route' });

  await ensureSchema();

  const jobs = await sql`
    SELECT id, status, total_rows, processed_rows, safe_fixes_applied, summary, created_at, updated_at
    FROM feed_jobs
    WHERE id = ${jobId} AND user_id = ${session.userId}
    LIMIT 1
  `;
  const job = jobs[0];
  if (!job) return send(res, 404, { error: 'Job not found' });

  const issueCounts = await sql`
    SELECT severity, COUNT(*)::int AS count
    FROM feed_issues
    WHERE job_id = ${jobId}
    GROUP BY severity
  `;

  const ruleRuns = await sql`
    SELECT rule_code, status, issues_found, started_at, completed_at
    FROM feed_rule_runs
    WHERE job_id = ${jobId}
    ORDER BY completed_at DESC NULLS LAST
  `;

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
