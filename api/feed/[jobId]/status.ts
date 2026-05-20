import { ensureSchema, getJobForUser, getSession, parseJobId, send } from '../_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  const jobId = parseJobId(req);
  if (!jobId) return send(res, 400, { error: 'jobId missing in route' });

  await ensureSchema();
  const job = await getJobForUser(session.userId, jobId);
  if (!job) return send(res, 404, { error: 'Job not found' });

  return send(res, 200, {
    jobId: job.id,
    status: job.status,
    totalRows: job.total_rows,
    processedRows: job.processed_rows,
    safeFixesApplied: job.safe_fixes_applied,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    summary: job.summary || null,
    errorMessage: job.error_message || null,
  });
}
