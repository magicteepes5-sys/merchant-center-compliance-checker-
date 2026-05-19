import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export type SessionUser = { userId: string; email: string };

export function signToken(payload: SessionUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token?: string): SessionUser {
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, JWT_SECRET) as SessionUser;
}
