import { ensureSchema, sql } from '../lib/db.js';
import { getSession, send } from './_shared.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  await ensureSchema();

  const rowsRaw = await sql`
    SELECT id, analysis_type, input_excerpt, result_json, created_at
    FROM analyses
    WHERE user_id = ${session.userId}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  const rows = rowsRaw as any[];

  const history = rows.map((row: any) => {
    const result = row.result_json || {};
    const status = row.analysis_type === 'website'
      ? (result.status || 'Unknown')
      : ((Array.isArray(result.riskyProducts) && result.riskyProducts.length > 0) ? 'Risk Detected' : 'Likely Approved');

    const summary = String(result.summary || '').trim() || 'No summary available';

    return {
      id: row.id,
      type: row.analysis_type,
      status,
      summary,
      inputExcerpt: row.input_excerpt || '',
      createdAt: row.created_at,
    };
  });

  return send(res, 200, { history });
}
