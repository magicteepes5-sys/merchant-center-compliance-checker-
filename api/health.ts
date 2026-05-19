export default async function handler(_req: any, res: any) {
  const body = { ok: true, ts: new Date().toISOString() };
  if (typeof res?.status === 'function' && typeof res?.json === 'function') {
    return res.status(200).json(body);
  }
  if (typeof res?.setHeader === 'function') res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res?.statusCode !== 'undefined') res.statusCode = 200;
  return res.end(JSON.stringify(body));
}
