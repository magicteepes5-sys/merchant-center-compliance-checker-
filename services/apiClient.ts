import type { AnalysisResult, AuditHistoryItem, FeedCleanerProcessResult, ProductFeedAnalysisResult, User } from '../types';

const TOKEN_KEY = 'mc_token';

function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
export function logoutLocal() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem('currentUser'); }

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });
  const raw = await res.text();
  let json: any = null;
  try { json = raw ? JSON.parse(raw) : null; } catch {}

  if (!res.ok) {
    const message = json?.detail
      ? `${json?.error || 'Request failed'}: ${json.detail}`
      : (json?.error || raw || `Request failed (${res.status})`);
    throw new Error(message);
  }

  if (!json) throw new Error(`Invalid JSON response (${res.status})`);
  return json as T;
}

export async function signup(email: string, password: string): Promise<User> {
  const data = await req<{token:string;user:User}>('/api/auth-signup', { method:'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const data = await req<{token:string;user:User}>('/api/auth-login', { method:'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function getMe(): Promise<User> {
  return req<User>('/api/me');
}

export async function analyzeWebsite(content: string): Promise<{result: AnalysisResult; searchesRemaining:number}> {
  return req('/api/analyze-website', { method:'POST', body: JSON.stringify({ content }) });
}

export async function analyzeFeed(feedContent: string): Promise<{result: ProductFeedAnalysisResult; searchesRemaining:number}> {
  return req('/api/analyze-feed', { method:'POST', body: JSON.stringify({ feedContent }) });
}

export async function getAuditHistory(): Promise<AuditHistoryItem[]> {
  const data = await req<{ history: AuditHistoryItem[] }>('/api/audit-history');
  return data.history || [];
}

export async function createCheckoutSession(): Promise<string> {
  const data = await req<{ url: string }>('/api/create-checkout-session', { method: 'POST' });
  if (!data?.url) throw new Error('Stripe checkout URL missing');
  return data.url;
}

export async function verifyEmailToken(token: string): Promise<User> {
  const data = await req<{ token: string; user: User }>('/api/auth-verify-email', { method: 'POST', body: JSON.stringify({ token }) });
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

async function reqBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const token = getToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(raw || `Request failed (${res.status})`);
  }

  return res.blob();
}

function parseCsvToRows(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h || `col_${idx}`] = cols[idx] ?? ''; });
    rows.push(row);
  }

  return rows;
}

function mapIssuesToUi(issues: any[]): FeedCleanerProcessResult['issues'] {
  return (issues || []).map((it: any) => ({
    row: Number(it.row_index || 0),
    field: it.field_name || 'unknown',
    severity: it.severity === 'error' ? 'critical' : it.severity === 'warning' ? 'high' : 'medium',
    message: it.message || it.rule_code || 'Issue detected',
    suggestedFix: typeof it.suggested_fix === 'string' ? it.suggested_fix : JSON.stringify(it.suggested_fix || ''),
    autoFixable: !!it.is_safe_fix,
  }));
}

function summarizeUi(issues: FeedCleanerProcessResult['issues']) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const high = issues.filter((i) => i.severity === 'high').length;
  const medium = issues.filter((i) => i.severity === 'medium').length;
  const autoFixable = issues.filter((i) => i.autoFixable).length;
  return { critical, high, medium, autoFixable };
}

export async function processFeedCleanerCsv(csv: string): Promise<FeedCleanerProcessResult> {
  const rows = parseCsvToRows(csv);
  if (!rows.length) throw new Error('CSV parsing failed. Please include header + at least 1 product row.');

  const uploaded = await req<{ jobId: string }>('/api/feed/upload', { method: 'POST', body: JSON.stringify({ rows }) });
  const jobId = uploaded.jobId;

  await req(`/api/feed/${encodeURIComponent(jobId)}/process`, { method: 'POST' });
  const issueRes = await req<{ issues: any[] }>(`/api/feed/${encodeURIComponent(jobId)}/issues`);
  const issues = mapIssuesToUi(issueRes.issues || []);

  return { jobId, issues, summary: summarizeUi(issues) };
}

export async function applyFeedCleanerSafeFixes(jobId: string): Promise<FeedCleanerProcessResult> {
  await req(`/api/feed/${encodeURIComponent(jobId)}/apply-safe-fixes`, { method: 'POST' });
  const issueRes = await req<{ issues: any[] }>(`/api/feed/${encodeURIComponent(jobId)}/issues`);
  const issues = mapIssuesToUi(issueRes.issues || []);
  return { jobId, issues, summary: summarizeUi(issues) };
}

export async function downloadFeedCleanerCleanedCsv(jobId: string): Promise<Blob> {
  return reqBlob(`/api/feed/${encodeURIComponent(jobId)}/download-cleaned`);
}

export async function downloadFeedCleanerReport(jobId: string): Promise<Blob> {
  return reqBlob(`/api/feed/${encodeURIComponent(jobId)}/report`);
}
