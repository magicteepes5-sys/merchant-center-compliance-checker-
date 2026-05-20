export type FeedIssueSeverity = 'error' | 'warning' | 'info';
export type FeedFixType = 'none' | 'auto' | 'manual';

export interface FeedIssue {
  severity: FeedIssueSeverity;
  code: string;
  attribute: string;
  row_index: number;
  item_id: string;
  before: string | null;
  after: string | null;
  fix_type: FeedFixType;
}

export interface RuleRunCount {
  evaluated: number;
  triggered: number;
  fixed: number;
}

export type RuleRunCounts = Record<string, RuleRunCount>;

export type NormalizedFeedRow = Record<string, string>;

export interface FeedValidationResult {
  issues: FeedIssue[];
  cleanedRows: NormalizedFeedRow[];
  ruleRunCounts: RuleRunCounts;
}

const REQUIRED_ATTRIBUTES = ['id', 'title', 'description', 'link', 'image_link', 'price'] as const;
const ALLOWED_AVAILABILITY = new Set(['in stock', 'out of stock', 'preorder', 'backorder']);
const PRICE_RE = /^([0-9]+(?:\.[0-9]{1,2})?)\s*([A-Za-z]{3})$/;

function initRuleCounter(ruleRunCounts: RuleRunCounts, code: string): RuleRunCount {
  if (!ruleRunCounts[code]) {
    ruleRunCounts[code] = { evaluated: 0, triggered: 0, fixed: 0 };
  }
  return ruleRunCounts[code];
}

function addIssue(
  issues: FeedIssue[],
  issue: FeedIssue,
  ruleRunCounts: RuleRunCounts,
): void {
  issues.push(issue);
  const stat = initRuleCounter(ruleRunCounts, issue.code);
  stat.triggered += 1;
  if (issue.fix_type === 'auto') stat.fixed += 1;
}

function normalizeSpace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function tryNormalizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isValidHttpUrl(trimmed)) return trimmed;

  if (/^www\./i.test(trimmed)) {
    const candidate = `https://${trimmed}`;
    if (isValidHttpUrl(candidate)) return candidate;
  }

  return null;
}

function normalizePrice(value: string, fallbackCurrency: string): { normalized: string | null; reason: 'ok' | 'unfixable' } {
  const raw = value.trim();
  if (!raw) return { normalized: null, reason: 'unfixable' };

  const direct = raw.match(PRICE_RE);
  if (direct) {
    const amount = Number(direct[1]);
    const currency = direct[2].toUpperCase();
    return { normalized: `${amount.toFixed(2)} ${currency}`, reason: 'ok' };
  }

  const stripped = raw
    .replace(/[,$]/g, (m) => (m === ',' ? '' : ''))
    .replace(/[$€£¥]/g, '')
    .trim();

  const withCurrency = stripped.match(/^([0-9]+(?:\.[0-9]{1,2})?)\s*([A-Za-z]{3})$/);
  if (withCurrency) {
    const amount = Number(withCurrency[1]);
    const currency = withCurrency[2].toUpperCase();
    return { normalized: `${amount.toFixed(2)} ${currency}`, reason: 'ok' };
  }

  const numberOnly = stripped.match(/^([0-9]+(?:\.[0-9]{1,2})?)$/);
  if (numberOnly) {
    const amount = Number(numberOnly[1]);
    return { normalized: `${amount.toFixed(2)} ${fallbackCurrency}`, reason: 'ok' };
  }

  return { normalized: null, reason: 'unfixable' };
}

export function validateAndCleanFeedRows(
  rows: NormalizedFeedRow[],
  options?: { defaultCurrency?: string },
): FeedValidationResult {
  const defaultCurrency = (options?.defaultCurrency || 'USD').toUpperCase();
  const issues: FeedIssue[] = [];
  const ruleRunCounts: RuleRunCounts = {};
  const cleanedRows: NormalizedFeedRow[] = [];
  const idCounts = new Map<string, number[]>();

  rows.forEach((inputRow, idx) => {
    const rowIndex = idx + 1;
    const row: NormalizedFeedRow = {};

    for (const [key, val] of Object.entries(inputRow || {})) {
      row[String(key).trim().toLowerCase()] = String(val ?? '').trim();
    }

    const titleCounter = initRuleCounter(ruleRunCounts, 'TITLE_BASIC_CLEANUP');
    titleCounter.evaluated += 1;
    const originalTitle = row.title || '';
    const cleanedTitle = normalizeSpace(originalTitle.replace(/[\u0000-\u001F\u007F]/g, ''));
    if (originalTitle !== cleanedTitle) {
      addIssue(issues, {
        severity: 'info',
        code: 'TITLE_BASIC_CLEANUP',
        attribute: 'title',
        row_index: rowIndex,
        item_id: row.id || '(missing)',
        before: originalTitle,
        after: cleanedTitle,
        fix_type: 'auto',
      }, ruleRunCounts);
      row.title = cleanedTitle;
    }

    const availabilityCounter = initRuleCounter(ruleRunCounts, 'INVALID_AVAILABILITY');
    availabilityCounter.evaluated += 1;
    const originalAvailability = row.availability || '';
    if (originalAvailability) {
      const normalizedAvailability = normalizeSpace(originalAvailability.replace(/_/g, ' ').toLowerCase());
      if (ALLOWED_AVAILABILITY.has(normalizedAvailability)) {
        if (normalizedAvailability !== originalAvailability) {
          addIssue(issues, {
            severity: 'warning',
            code: 'INVALID_AVAILABILITY',
            attribute: 'availability',
            row_index: rowIndex,
            item_id: row.id || '(missing)',
            before: originalAvailability,
            after: normalizedAvailability,
            fix_type: 'auto',
          }, ruleRunCounts);
          row.availability = normalizedAvailability;
        }
      } else {
        addIssue(issues, {
          severity: 'error',
          code: 'INVALID_AVAILABILITY',
          attribute: 'availability',
          row_index: rowIndex,
          item_id: row.id || '(missing)',
          before: originalAvailability,
          after: null,
          fix_type: 'manual',
        }, ruleRunCounts);
      }
    }

    for (const attr of ['link', 'image_link'] as const) {
      const counter = initRuleCounter(ruleRunCounts, 'INVALID_URL');
      counter.evaluated += 1;
      const original = row[attr] || '';
      if (!original) continue;

      if (!isValidHttpUrl(original)) {
        const normalized = tryNormalizeUrl(original);
        if (normalized) {
          addIssue(issues, {
            severity: 'warning',
            code: 'INVALID_URL',
            attribute: attr,
            row_index: rowIndex,
            item_id: row.id || '(missing)',
            before: original,
            after: normalized,
            fix_type: 'auto',
          }, ruleRunCounts);
          row[attr] = normalized;
        } else {
          addIssue(issues, {
            severity: 'error',
            code: 'INVALID_URL',
            attribute: attr,
            row_index: rowIndex,
            item_id: row.id || '(missing)',
            before: original,
            after: null,
            fix_type: 'manual',
          }, ruleRunCounts);
        }
      }
    }

    const priceCounter = initRuleCounter(ruleRunCounts, 'PRICE_FORMAT_NORMALIZED');
    priceCounter.evaluated += 1;
    const originalPrice = row.price || '';
    if (originalPrice) {
      const normalizedPrice = normalizePrice(originalPrice, defaultCurrency);
      if (normalizedPrice.normalized && normalizedPrice.normalized !== originalPrice) {
        addIssue(issues, {
          severity: 'warning',
          code: 'PRICE_FORMAT_NORMALIZED',
          attribute: 'price',
          row_index: rowIndex,
          item_id: row.id || '(missing)',
          before: originalPrice,
          after: normalizedPrice.normalized,
          fix_type: 'auto',
        }, ruleRunCounts);
        row.price = normalizedPrice.normalized;
      } else if (!normalizedPrice.normalized) {
        addIssue(issues, {
          severity: 'error',
          code: 'PRICE_FORMAT_NORMALIZED',
          attribute: 'price',
          row_index: rowIndex,
          item_id: row.id || '(missing)',
          before: originalPrice,
          after: null,
          fix_type: 'manual',
        }, ruleRunCounts);
      }
    }

    const requiredCounter = initRuleCounter(ruleRunCounts, 'MISSING_REQUIRED_ATTRIBUTE');
    for (const attr of REQUIRED_ATTRIBUTES) {
      requiredCounter.evaluated += 1;
      const value = row[attr] || '';
      if (!value) {
        addIssue(issues, {
          severity: 'error',
          code: 'MISSING_REQUIRED_ATTRIBUTE',
          attribute: attr,
          row_index: rowIndex,
          item_id: row.id || '(missing)',
          before: null,
          after: null,
          fix_type: 'none',
        }, ruleRunCounts);
      }
    }

    if (row.id) {
      const key = row.id;
      const entries = idCounts.get(key) || [];
      entries.push(rowIndex);
      idCounts.set(key, entries);
    }

    cleanedRows.push(row);
  });

  const duplicateCounter = initRuleCounter(ruleRunCounts, 'DUPLICATE_ID');
  duplicateCounter.evaluated += cleanedRows.length;
  for (const [id, indexes] of Array.from(idCounts.entries())) {
    if (indexes.length <= 1) continue;
    for (const rowIndex of indexes) {
      addIssue(issues, {
        severity: 'error',
        code: 'DUPLICATE_ID',
        attribute: 'id',
        row_index: rowIndex,
        item_id: id,
        before: id,
        after: null,
        fix_type: 'manual',
      }, ruleRunCounts);
    }
  }

  return { issues, cleanedRows, ruleRunCounts };
}
