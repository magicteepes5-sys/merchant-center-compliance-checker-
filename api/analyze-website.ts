import { randomUUID } from 'node:crypto';
import { ensureSchema, sql } from '../lib/db.js';
import { getSession, send } from './_shared.js';
type WebsiteResult = {
  status: 'Approved' | 'Rejected';
  summary: string;
  issues: Array<{
    policy: string;
    problem: string;
    recommendation: string;
  }>;
};

function parseJsonObject(text: string): any {
  const trimmed = String(text || '').trim();
  if (!trimmed) throw new Error('Empty model response text');

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error(`Invalid JSON response: ${trimmed.slice(0, 240)}`);
  }
}

function extractResponseText(data: any): string {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }

  const parts: string[] = [];
  for (const out of data?.output || []) {
    for (const c of out?.content || []) {
      if (c?.type === 'output_text' && typeof c?.text === 'string') parts.push(c.text);
      if (c?.type === 'text' && typeof c?.text === 'string') parts.push(c.text);
    }
  }

  return parts.join('\n').trim();
}

async function analyzeWithOpenAI(content: string, apiKey: string): Promise<WebsiteResult> {
  const resp = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are an expert Google Merchant Center policy analyst. Return ONLY valid JSON with this exact shape: {"status":"Approved|Rejected","summary":"string","issues":[{"policy":"string","problem":"string","recommendation":"string"}]}.',
        },
        {
          role: 'user',
          content: `Analyze this website content for Google Merchant Center policy risk:\n\n${content}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'website_audit',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              status: { type: 'string', enum: ['Approved', 'Rejected'] },
              summary: { type: 'string' },
              issues: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    policy: { type: 'string' },
                    problem: { type: 'string' },
                    recommendation: { type: 'string' },
                  },
                  required: ['policy', 'problem', 'recommendation'],
                },
              },
            },
            required: ['status', 'summary', 'issues'],
          },
        },
      },
      temperature: 0.2,
      max_output_tokens: 900,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${err}`);
  }

  const data: any = await resp.json();
  const text = extractResponseText(data);
  const parsed = parseJsonObject(text);

  if (!parsed?.status || !parsed?.summary || !Array.isArray(parsed?.issues)) {
    throw new Error(`Invalid model output shape: ${JSON.stringify(parsed).slice(0, 240)}`);
  }

  return parsed as WebsiteResult;
}

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return send(res, 500, { error: 'OPENAI_API_KEY missing' });

  try {
    const result = await analyzeWithOpenAI(content, apiKey);

    await sql`UPDATE users SET searches_remaining = searches_remaining - 1 WHERE id = ${session.userId}`;
    await sql`INSERT INTO analyses (id, user_id, analysis_type, input_excerpt, result_json) VALUES (${randomUUID()}, ${session.userId}, 'website', ${content.slice(0, 300)}, ${JSON.stringify(result)}::jsonb)`;
    const latest = await sql`SELECT searches_remaining FROM users WHERE id = ${session.userId}`;

    return send(res, 200, { result, searchesRemaining: latest[0].searches_remaining });
  } catch (error: any) {
    return send(res, 500, { error: 'Analysis failed', detail: String(error?.message || error) });
  }
}
