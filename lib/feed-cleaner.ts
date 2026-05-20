import { randomUUID } from 'node:crypto';

export type FeedRow = Record<string, any>;

export type DetectedIssue = {
  id: string;
  rowIndex: number;
  itemId: string;
  fieldName: string;
  severity: 'warning' | 'error';
  ruleCode: string;
  message: string;
  suggestedFix: Record<string, any> | null;
  isSafeFix: boolean;
};

export function normalizeRows(input: any): FeedRow[] {
  if (!Array.isArray(input)) return [];
  return input.filter((x) => x && typeof x === 'object').map((x) => ({ ...x }));
}

export function detectIssues(rows: FeedRow[]): DetectedIssue[] {
  const issues: DetectedIssue[] = [];

  rows.forEach((row, i) => {
    const itemId = String(row.id || row.offer_id || row.sku || `row-${i + 1}`);
    const title = String(row.title || '').trim();
    const description = String(row.description || '').trim();
    const priceRaw = String(row.price || '').trim();

    if (!title) {
      issues.push({
        id: randomUUID(),
        rowIndex: i,
        itemId,
        fieldName: 'title',
        severity: 'error',
        ruleCode: 'TITLE_MISSING',
        message: 'Title is missing.',
        suggestedFix: null,
        isSafeFix: false,
      });
    } else if (title.length < 10) {
      issues.push({
        id: randomUUID(),
        rowIndex: i,
        itemId,
        fieldName: 'title',
        severity: 'warning',
        ruleCode: 'TITLE_TOO_SHORT',
        message: 'Title is very short for shopping quality.',
        suggestedFix: null,
        isSafeFix: false,
      });
    }

    if (!description) {
      issues.push({
        id: randomUUID(),
        rowIndex: i,
        itemId,
        fieldName: 'description',
        severity: 'warning',
        ruleCode: 'DESCRIPTION_MISSING',
        message: 'Description is missing.',
        suggestedFix: null,
        isSafeFix: false,
      });
    }

    if (!priceRaw) {
      issues.push({
        id: randomUUID(),
        rowIndex: i,
        itemId,
        fieldName: 'price',
        severity: 'error',
        ruleCode: 'PRICE_MISSING',
        message: 'Price is missing.',
        suggestedFix: null,
        isSafeFix: false,
      });
    }

    if (typeof row.title === 'string' && row.title !== row.title.trim()) {
      const fixed = row.title.trim();
      issues.push({
        id: randomUUID(),
        rowIndex: i,
        itemId,
        fieldName: 'title',
        severity: 'warning',
        ruleCode: 'TITLE_WHITESPACE',
        message: 'Title has leading/trailing whitespace.',
        suggestedFix: { title: fixed },
        isSafeFix: true,
      });
    }
  });

  return issues;
}

export function applySafeFixes(rows: FeedRow[], issues: DetectedIssue[]): { cleanedRows: FeedRow[]; appliedCount: number } {
  const cleanedRows = rows.map((r) => ({ ...r }));
  let appliedCount = 0;

  for (const issue of issues) {
    if (!issue.isSafeFix || !issue.suggestedFix) continue;
    const row = cleanedRows[issue.rowIndex];
    if (!row) continue;
    for (const [field, value] of Object.entries(issue.suggestedFix)) {
      row[field] = value;
      appliedCount += 1;
    }
  }

  return { cleanedRows, appliedCount };
}

export function rowsToCsv(rows: FeedRow[]): string {
  if (!rows.length) return '';
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) headerSet.add(key);
  }
  const headers = Array.from(headerSet);

  const escape = (value: any) => {
    const text = value == null ? '' : String(value);
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };

  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}
