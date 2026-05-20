import { randomUUID } from 'node:crypto';
import { normalizeRows } from '../../lib/feed-cleaner.js';
import { ensureSchema, getSession, send, sql } from './_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  await ensureSchema();

  const rows = normalizeRows(req.body?.rows);
  if (!rows.length) {
    return send(res, 400, {
      error: 'rows is required and must be a non-empty array of objects',
      note: 'Multipart file upload is not implemented in this MVP scaffold. Send JSON body: { rows: [...] }.',
    });
  }

  const jobId = randomUUID();
  await sql`
    INSERT INTO feed_jobs (id, user_id, status, total_rows, processed_rows, original_rows, cleaned_rows, input_format)
    VALUES (${jobId}, ${session.userId}, 'uploaded', ${rows.length}, 0, ${JSON.stringify(rows)}::jsonb, ${JSON.stringify(rows)}::jsonb, 'json')
  `;

  return send(res, 201, { jobId, status: 'uploaded', totalRows: rows.length });
}
