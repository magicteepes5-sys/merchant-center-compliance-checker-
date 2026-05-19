import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { ensureSchema, sql } from '../lib/db.js';
import { signToken } from '../lib/auth.js';
import { send } from './_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    await ensureSchema();
    const { email, password } = req.body || {};
    if (!email || !password || String(password).length < 6) {
      return send(res, 400, { error: 'Invalid email or password' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const uid = randomUUID();
    const inserted = await sql`INSERT INTO users (id, email, password_hash) VALUES (${uid}, ${String(email).toLowerCase()}, ${hash}) RETURNING id, email, searches_remaining`;
    const user = inserted[0];
    const token = signToken({ userId: user.id, email: user.email });
    return send(res, 200, { token, user: { uid: user.id, email: user.email, searchesRemaining: user.searches_remaining } });
  } catch (e: any) {
    if (String(e?.message || '').toLowerCase().includes('duplicate')) return send(res, 409, { error: 'User already exists' });
    return send(res, 500, { error: 'Signup failed', detail: String(e?.message || e) });
  }
}
