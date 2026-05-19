import { verifyToken } from '../lib/auth.js';

export function send(res: any, status: number, body: any) {
  // Works across Vercel runtimes (helpers may differ)
  if (typeof res?.status === 'function' && typeof res?.json === 'function') {
    return res.status(status).json(body);
  }
  if (typeof res?.setHeader === 'function') res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res?.statusCode !== 'undefined') res.statusCode = status;
  return res.end(JSON.stringify(body));
}

export function getSession(req: any): { userId: string; email: string } | null {
  try {
    const h = req.headers?.authorization || '';
    if (!h.startsWith('Bearer ')) return null;
    const token = h.slice(7);
    return verifyToken(token);
  } catch {
    return null;
  }
}
