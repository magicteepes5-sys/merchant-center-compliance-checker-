import type { AnalysisResult, AuditHistoryItem, ProductFeedAnalysisResult, User } from '../types';

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
