import { applySafeFixes } from '../../../lib/feed-cleaner.js';
import { ensureSchema, getSession, parseJobId, send, sql } from '../_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const jobId = parseJobId(req);
  if (!jobId) return send(res, 400, { error: 'jobId missing in route' });

  await ensureSchema();

  const jobs = await sql`SELECT * FROM feed_jobs WHERE id = ${jobId} AND user_id = ${session.userId} LIMIT 1`;
  const job = jobs[0];
  if (!job) return send(res, 404, { error: 'Job not found' });

  const issues = await sql`SELECT * FROM feed_issues WHERE job_id = ${jobId} ORDER BY created_at ASC`;
  const { cleanedRows, appliedCount } = applySafeFixes(
    Array.isArray(job.cleaned_rows) ? job.cleaned_rows : [],
    issues as any,
  );

  await sql`
    UPDATE feed_jobs
    SET cleaned_rows = ${JSON.stringify(cleanedRows)}::jsonb,
        safe_fixes_applied = COALESCE(safe_fixes_applied, 0) + ${appliedCount},
        updated_at = NOW()
    WHERE id = ${jobId}
  `;

  await sql`
    UPDATE feed_issues
    SET status = CASE WHEN is_safe_fix = TRUE THEN 'fixed' ELSE status END
    WHERE job_id = ${jobId}
  `;

  return send(res, 200, { jobId, appliedCount });
}
