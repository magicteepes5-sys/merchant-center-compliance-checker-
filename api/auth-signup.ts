import bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ensureSchema, sql } from '../lib/db.js';
import { signToken } from '../lib/auth.js';
import { send } from './_shared.js';

function getBaseUrl(req: any) {
  const envUrl = process.env.APP_URL || process.env.VITE_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${proto}://${host}`;
}

function makeFingerprint(req: any): string {
  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || '');
  const ua = String(req.headers['user-agent'] || '');
  const al = String(req.headers['accept-language'] || '');
  return createHash('sha256').update(`${ip}|${ua}|${al}`).digest('hex');
}

async function sendVerificationEmail(to: string, verifyUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Verify your MC Checker email</h2>
      <p>Click below to verify your account and unlock your 3 free credits.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px">Verify email</a></p>
      <p>If the button doesn't work, use this link:</p>
      <p>${verifyUrl}</p>
    </div>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Verify your MC Checker account',
      html
    })
  });

  return resp.ok;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    await ensureSchema();
    const { email, password } = req.body || {};
    if (!email || !password || String(password).length < 6) {
      return send(res, 400, { error: 'Invalid email or password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const fingerprint = makeFingerprint(req);
    const existingFingerprint = await sql`SELECT id FROM users WHERE signup_fingerprint = ${fingerprint} LIMIT 1`;
    if (existingFingerprint[0]) {
      return send(res, 429, { error: 'Free trial already claimed on this device/network. Please sign in or contact support.' });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const uid = randomUUID();
    const verificationToken = randomBytes(32).toString('hex');

    const inserted = await sql`
      INSERT INTO users (id, email, password_hash, searches_remaining, email_verified, verification_token, verification_token_expires_at, signup_fingerprint, is_paid)
      VALUES (${uid}, ${normalizedEmail}, ${hash}, 0, FALSE, ${verificationToken}, NOW() + INTERVAL '24 hours', ${fingerprint}, FALSE)
      RETURNING id, email, searches_remaining, email_verified, is_paid
    `;

    const user = inserted[0];
    const token = signToken({ userId: user.id, email: user.email });

    const verifyUrl = `${getBaseUrl(req)}/?verify=${verificationToken}`;
    const emailSent = await sendVerificationEmail(user.email, verifyUrl);

    return send(res, 200, {
      token,
      verificationRequired: true,
      emailSent,
      verifyUrl: process.env.NODE_ENV === 'production' ? undefined : verifyUrl,
      user: {
        uid: user.id,
        email: user.email,
        searchesRemaining: user.searches_remaining,
        emailVerified: !!user.email_verified,
        isPaid: !!user.is_paid
      }
    });
  } catch (e: any) {
    if (String(e?.message || '').toLowerCase().includes('duplicate')) return send(res, 409, { error: 'User already exists' });
    return send(res, 500, { error: 'Signup failed', detail: String(e?.message || e) });
  }
}
