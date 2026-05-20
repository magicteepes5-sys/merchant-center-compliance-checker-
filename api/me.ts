import { ensureSchema, sql } from '../lib/db.js';
import { getSession, send } from './_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });
  await ensureSchema();
  const found = await sql`SELECT id, email, searches_remaining, email_verified, is_paid FROM users WHERE id = ${session.userId} LIMIT 1`;
  const row = found[0];
  if (!row) return send(res, 404, { error: 'User not found' });
  return send(res, 200, { uid: row.id, email: row.email, searchesRemaining: row.searches_remaining, emailVerified: !!row.email_verified, isPaid: !!row.is_paid });
}
