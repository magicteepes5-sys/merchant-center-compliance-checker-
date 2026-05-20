import { ensureSchema, sql } from '../../lib/db.js';
import { getSession, send } from '../_shared.js';

export { send, getSession, ensureSchema, sql };

export function parseJobId(req: any): string | null {
  const jobId = req.query?.jobId;
  if (typeof jobId === 'string' && jobId.trim()) return jobId.trim();
  if (Array.isArray(jobId) && jobId[0]) return String(jobId[0]).trim();
  return null;
}

export async function getJobForUser(userId: string, jobId: string) {
  const rows = await sql`SELECT * FROM feed_jobs WHERE id = ${jobId} AND user_id = ${userId} LIMIT 1`;
  return rows[0] || null;
}
