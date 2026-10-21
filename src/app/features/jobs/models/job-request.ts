export interface JobRequest {

  serviceRequestId: number;

  customerId: number;

  siteId: number;

  assetId?: number | null;

  technicianId?: number | null;

  scheduledAt?: string | null;

  notes?: string | null;

  workSummary?: string | null;
}