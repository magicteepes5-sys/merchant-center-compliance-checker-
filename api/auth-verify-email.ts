import { ensureSchema, sql } from '../lib/db.js';
import { signToken } from '../lib/auth.js';
import { send } from './_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  await ensureSchema();
  const token = String(req.query?.token || req.body?.token || '').trim();
  if (!token) return send(res, 400, { error: 'Missing token' });

  const found = await sql`
    SELECT id, email, searches_remaining, email_verified, trial_granted_at
    FROM users
    WHERE verification_token = ${token}
      AND verification_token_expires_at > NOW()
    LIMIT 1
  `;

  const row = found[0];
  if (!row) return send(res, 400, { error: 'Invalid or expired verification token' });

  const grantCredits = !row.email_verified && !row.trial_granted_at;
  const updatedRows = await sql`
    UPDATE users
    SET
      email_verified = TRUE,
      searches_remaining = CASE WHEN ${grantCredits} THEN searches_remaining + 3 ELSE searches_remaining END,
      trial_granted_at = CASE WHEN ${grantCredits} THEN NOW() ELSE trial_granted_at END,
      verification_token = NULL,
      verification_token_expires_at = NULL
    WHERE id = ${row.id}
    RETURNING id, email, searches_remaining, email_verified
  `;

  const updated = updatedRows[0];
  const jwt = signToken({ userId: updated.id, email: updated.email });

  return send(res, 200, {
    ok: true,
    message: 'Email verified successfully',
    token: jwt,
    user: {
      uid: updated.id,
      email: updated.email,
      searchesRemaining: updated.searches_remaining,
      emailVerified: !!updated.email_verified,
    },
  });
}
