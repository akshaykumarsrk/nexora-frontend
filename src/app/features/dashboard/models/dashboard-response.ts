// Why models?
// Imagine our API returns:
// {
//   "revenue": 1240000,
//   "employees": 248,
//   "activeProjects": 36,
//   "pendingTasks": 142
// }
// The interface describes that structure. So: 
// models/dashboard-summary.ts
// means: "These are the data structures used by the Dashboard feature."

// Why isn't this in shared/models?
// Because: DashboardSummary is only used by the Dashboard feature. It is not shared with other features. So it belongs in the dashboard feature folder, not in shared/models.
// Therefore: features/dashboard/models is better than shared/models for this interface. It is a feature-specific model, not a shared model.
// If we had user then it is used across the entire application, then we'd consider a more global location.

export interface DashboardResponse {
  summary: DashboardSummary;
  jobStatus: JobStatus[];
  revenue: Revenue[];
}

export interface DashboardSummary {
  totalCustomers: number;
  totalSites: number;
  totalAssets: number;
  pendingServiceRequests: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface JobStatus {
  status: string;
  count: number;
}

export interface Revenue {
  date: string;
  amount: number;
}