import { verifyToken } from '../lib/auth';

<<<<<<< HEAD
export function send(res: any, status: number, body: any) {
  res.status(status).json(body);
}

export function getSession(req: any): { userId: string; email: string } | null {
  const h = req.headers?.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  const token = h.slice(7);
  return verifyToken(token);
=======
export function send(res: any, code: number, data: unknown) {
  res.status(code).json(data);
}

export function getSession(req: any) {
  try {
    return verifyToken(req.headers.authorization);
  } catch {
    return null;
  }
>>>>>>> 37455f2 (Fix serverless auth/db runtime errors and improve JSON error handling)
}
