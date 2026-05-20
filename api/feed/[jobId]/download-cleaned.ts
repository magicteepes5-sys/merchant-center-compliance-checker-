import { rowsToCsv } from '../../../lib/feed-cleaner.js';
import { ensureSchema, getSession, parseJobId, send, sql } from '../_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const jobId = parseJobId(req);
  if (!jobId) return send(res, 400, { error: 'jobId missing in route' });

  await ensureSchema();

  const jobs = await sql`SELECT cleaned_rows FROM feed_jobs WHERE id = ${jobId} AND user_id = ${session.userId} LIMIT 1`;
  if (!jobs[0]) return send(res, 404, { error: 'Job not found' });

  const rows = Array.isArray(jobs[0].cleaned_rows) ? jobs[0].cleaned_rows : [];
  const csv = rowsToCsv(rows);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="cleaned-${jobId}.csv"`);
  return res.status(200).send(csv);
}
