import type { FeedValidationResult, NormalizedFeedRow } from './feed-validation-engine.js';
import { validateAndCleanFeedRows } from './feed-validation-engine.js';

export interface CsvProcessingResult extends FeedValidationResult {
  headers: string[];
  rowsParsed: number;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  cells.push(current);
  return cells;
}

export function parseCsvToNormalizedRows(csvContent: string): { headers: string[]; rows: NormalizedFeedRow[] } {
  const lines = String(csvContent || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map((h) => h.trim().toLowerCase());
  const rows: NormalizedFeedRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row: NormalizedFeedRow = {};

    for (let j = 0; j < headers.length; j += 1) {
      const key = headers[j] || `column_${j}`;
      row[key] = (values[j] ?? '').trim();
    }

    rows.push(row);
  }

  return { headers, rows };
}

export function processCsvFeed(csvContent: string, options?: { defaultCurrency?: string }): CsvProcessingResult {
  const parsed = parseCsvToNormalizedRows(csvContent);
  const validation = validateAndCleanFeedRows(parsed.rows, options);

  return {
    ...validation,
    headers: parsed.headers,
    rowsParsed: parsed.rows.length,
  };
}
