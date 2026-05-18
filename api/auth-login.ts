import bcrypt from 'bcryptjs';
import { ensureSchema, sql } from '../lib/db';
import { signToken } from '../lib/auth';
import { send } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    await ensureSchema();
    const { email, password } = req.body || {};
    const found = await sql`SELECT id, email, password_hash, searches_remaining FROM users WHERE email = ${String(email).toLowerCase()} LIMIT 1`;
    const row = found[0];
    if (!row) return send(res, 401, { error: 'Invalid credentials' });
    const ok = await bcrypt.compare(String(password), row.password_hash);
    if (!ok) return send(res, 401, { error: 'Invalid credentials' });
    const token = signToken({ userId: row.id, email: row.email });
    return send(res, 200, { token, user: { uid: row.id, email: row.email, searchesRemaining: row.searches_remaining } });
  } catch {
    return send(res, 500, { error: 'Login failed' });
  }
}
