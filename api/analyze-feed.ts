import { randomUUID } from 'node:crypto';
import { ensureSchema, sql } from '../lib/db.js';
import { processCsvFeed } from '../lib/feed-csv-processor.js';
import { getSession, send } from './_shared.js';
type FeedResult = {
  summary: string;
  safeProductCount: number;
  riskyProducts: Array<{
    id: string;
    title: string;
    policy: string;
    reason: string;
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

async function analyzeWithOpenAI(feedContent: string, apiKey: string): Promise<FeedResult> {
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
            'You are a Google Merchant Center product data expert. Return ONLY valid JSON with this exact shape: {"summary":"string","safeProductCount":number,"riskyProducts":[{"id":"string","title":"string","policy":"string","reason":"string"}]}.',
        },
        {
          role: 'user',
          content: `Analyze this product feed for Merchant Center compliance risk:\n\n${feedContent}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'feed_audit',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              safeProductCount: { type: 'number' },
              riskyProducts: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    policy: { type: 'string' },
                    reason: { type: 'string' },
                  },
                  required: ['id', 'title', 'policy', 'reason'],
                },
              },
            },
            required: ['summary', 'safeProductCount', 'riskyProducts'],
          },
        },
      },
      temperature: 0.1,
      max_output_tokens: 1200,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${err}`);
  }

  const data: any = await resp.json();
  const text = extractResponseText(data);
  const parsed = parseJsonObject(text);

  if (!parsed?.summary || typeof parsed?.safeProductCount !== 'number' || !Array.isArray(parsed?.riskyProducts)) {
    throw new Error(`Invalid model output shape: ${JSON.stringify(parsed).slice(0, 240)}`);
  }

  return parsed as FeedResult;
}

function rowsToPromptText(rows: Array<Record<string, string>>): string {
  if (!rows.length) return '';

  return rows
    .map((row) => {
      const orderedEntries = Object.entries(row).sort(([a], [b]) => a.localeCompare(b));
      return orderedEntries.map(([k, v]) => `${k}=${v}`).join(' | ');
    })
    .join('\n');
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

  const feedContent = String(req.body?.feedContent || '').trim();
  if (!feedContent) return send(res, 400, { error: 'feedContent is required' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return send(res, 500, { error: 'OPENAI_API_KEY missing' });

  try {
    const processedFeed = processCsvFeed(feedContent, { defaultCurrency: 'USD' });
    const cleanedRowsExcerpt = processedFeed.cleanedRows.slice(0, 250);
    const cleanedPromptText = rowsToPromptText(cleanedRowsExcerpt);
    const issueSummary = {
      totalIssues: processedFeed.issues.length,
      bySeverity: {
        error: processedFeed.issues.filter((i) => i.severity === 'error').length,
        warning: processedFeed.issues.filter((i) => i.severity === 'warning').length,
        info: processedFeed.issues.filter((i) => i.severity === 'info').length,
      },
      topIssues: processedFeed.issues.slice(0, 50),
      ruleRunCounts: processedFeed.ruleRunCounts,
    };

    const modelInput = cleanedPromptText
      ? `CLEANED FEED ROWS (first ${cleanedRowsExcerpt.length} rows):\n${cleanedPromptText}\n\nVALIDATION SUMMARY:\n${JSON.stringify(issueSummary)}`
      : feedContent;

    const result = await analyzeWithOpenAI(modelInput, apiKey);

    await sql`UPDATE users SET searches_remaining = searches_remaining - 1 WHERE id = ${session.userId}`;
    await sql`INSERT INTO analyses (id, user_id, analysis_type, input_excerpt, result_json) VALUES (${randomUUID()}, ${session.userId}, 'feed', ${feedContent.slice(0, 300)}, ${JSON.stringify(result)}::jsonb)`;
    const latest = await sql`SELECT searches_remaining FROM users WHERE id = ${session.userId}`;

    return send(res, 200, {
      result,
      feedValidation: {
        headers: processedFeed.headers,
        rowsParsed: processedFeed.rowsParsed,
        issues: processedFeed.issues,
        ruleRunCounts: processedFeed.ruleRunCounts,
      },
      searchesRemaining: latest[0].searches_remaining,
    });
  } catch (error: any) {
    return send(res, 500, { error: 'Analysis failed', detail: String(error?.message || error) });
  }
}
