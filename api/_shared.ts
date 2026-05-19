import { verifyToken } from '../lib/auth';

export function send(res: any, status: number, body: any) {
  res.status(status).json(body);
}

export function getSession(req: any): { userId: string; email: string } | null {
  const h = req.headers?.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  const token = h.slice(7);
  return verifyToken(token);
}
