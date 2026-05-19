import * as jwtImport from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

type JwtLike = {
  sign?: (...args: any[]) => string;
  verify?: (...args: any[]) => any;
  default?: {
    sign?: (...args: any[]) => string;
    verify?: (...args: any[]) => any;
  };
};

const jwt = jwtImport as JwtLike;
const signFn = jwt.sign ?? jwt.default?.sign;
const verifyFn = jwt.verify ?? jwt.default?.verify;

if (!signFn || !verifyFn) {
  throw new Error('jsonwebtoken import interop failed: sign/verify unavailable');
}

export type SessionUser = { userId: string; email: string };

export function signToken(payload: SessionUser) {
  return signFn(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token?: string): SessionUser {
  if (!token) throw new Error('Unauthorized');
  return verifyFn(token, JWT_SECRET) as SessionUser;
}
