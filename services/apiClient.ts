import type { AnalysisResult, ProductFeedAnalysisResult, User } from '../types';

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
  const json = await res.json();
  if (!res.ok) throw new Error(json?.detail ? `${json?.error || 'Request failed'}: ${json.detail}` : (json?.error || 'Request failed'));
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
