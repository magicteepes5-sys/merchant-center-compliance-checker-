import { GoogleGenAI, Type } from '@google/genai';
import { ensureSchema, sql } from '../lib/db';
import { getSession, send } from './_shared';

const schema = {type: Type.OBJECT,properties:{status:{type:Type.STRING,enum:['Approved','Rejected']},summary:{type:Type.STRING},issues:{type:Type.ARRAY,items:{type:Type.OBJECT,properties:{policy:{type:Type.STRING},problem:{type:Type.STRING},recommendation:{type:Type.STRING}},required:['policy','problem','recommendation']}}},required:['status','summary','issues']};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Unauthorized' });

  await ensureSchema();
  const u = await sql`SELECT searches_remaining FROM users WHERE id = ${session.userId} LIMIT 1`;
  const user = u[0];
  if (!user) return send(res, 404, { error: 'User not found' });
  if (user.searches_remaining <= 0) return send(res, 402, { error: 'No credits left' });

  const content = String(req.body?.content || '').trim();
  if (!content) return send(res, 400, { error: 'content is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return send(res, 500, { error: 'GEMINI_API_KEY missing' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert Google Merchant Center policy analyst. Analyze the content and output JSON only.

${content}`;
    const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.2 } });
    const result = JSON.parse(resp.text.trim());

    await sql`UPDATE users SET searches_remaining = searches_remaining - 1 WHERE id = ${session.userId}`;
    await sql`INSERT INTO analyses (user_id, analysis_type, input_excerpt, result_json) VALUES (${session.userId}, 'website', ${content.slice(0,300)}, ${JSON.stringify(result)}::jsonb)`;
    const latest = await sql`SELECT searches_remaining FROM users WHERE id = ${session.userId}`;

    return send(res, 200, { result, searchesRemaining: latest[0].searches_remaining });
  } catch {
    return send(res, 500, { error: 'Analysis failed' });
  }
}
