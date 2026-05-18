import { verifyToken } from '../lib/auth';

export function send(res: VercelResponse, code: number, data: unknown) {
  res.status(code).json(data);
}

export function getSession(req: VercelRequest) {
  try {
    return verifyToken(req.headers.authorization);
  } catch {
    return null;
  }
}
