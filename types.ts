
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
  emailVerified?: boolean;
  isPaid?: boolean;
}

export interface AuditHistoryItem {
  id: string;
  type: 'website' | 'feed' | string;
  status: string;
  summary: string;
  inputExcerpt: string;
  createdAt: string;
}

export interface FeedCleanerIssue {
  row: number;
  field: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  message: string;
  suggestedFix?: string;
  autoFixable?: boolean;
}

export interface FeedCleanerProcessResult {
  jobId: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    autoFixable: number;
  };
  issues: FeedCleanerIssue[];
}
