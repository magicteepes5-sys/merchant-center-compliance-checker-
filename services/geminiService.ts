import type { AnalysisResult, ProductFeedAnalysisResult } from '../types';

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const analyzeWebsiteContent = async (content: string): Promise<AnalysisResult> => {
  return postJSON<AnalysisResult>('/api/analyze-website', { content });
};

export const analyzeProductFeed = async (feedContent: string): Promise<ProductFeedAnalysisResult> => {
  return postJSON<ProductFeedAnalysisResult>('/api/analyze-feed', { feedContent });
};
