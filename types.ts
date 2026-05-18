
export interface PolicyIssue {
  policy: string;
  problem: string;
  recommendation: string;
}

export interface AnalysisResult {
  status: 'Approved' | 'Rejected';
  summary: string;
  issues: PolicyIssue[];
}

export interface ProductIssue {
  id: string;
  title: string;
  policy: string;
  reason: string;
}

export interface ProductFeedAnalysisResult {
  summary: string;
  safeProductCount: number;
  riskyProducts: ProductIssue[];
}

export interface User {
  uid: string;
  email: string;
  searchesRemaining: number;
}
