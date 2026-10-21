export interface Job {
  id: number;
  jobNumber: string;

  status: JobStatus;

  serviceRequestId?: number;
  customerId?: number;
  siteId?: number;
  assetId?: number;
  technicianId?: number;

  serviceRequest?: any;
  customer?: any;
  site?: any;
  asset?: any;
  technician?: any;

  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;

  workSummary?: string;

  notes?: string;

  createdAt?: string;
}

export type JobStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';