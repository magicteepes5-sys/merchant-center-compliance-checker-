import { ensureSchema, getSession, parseJobId, send, sql } from '../_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const jobId = parseJobId(req);
  if (!jobId) return send(res, 400, { error: 'jobId missing in route' });

  await ensureSchema();

  const ownership = await sql`SELECT id FROM feed_jobs WHERE id = ${jobId} AND user_id = ${session.userId} LIMIT 1`;
  if (!ownership[0]) return send(res, 404, { error: 'Job not found' });

  const issues = await sql`
    SELECT id, row_index, item_id, field_name, severity, rule_code, message, suggested_fix, is_safe_fix, status, created_at
    FROM feed_issues
    WHERE job_id = ${jobId}
    ORDER BY row_index ASC, created_at ASC
  `;

  return send(res, 200, { jobId, issues });
}
