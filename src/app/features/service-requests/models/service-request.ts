export interface ServiceRequest {
  id: number;

  customerId: number;
  siteId: number;
  assetId: number | null;

  title: string;
  description: string | null;

  priority: string;
  status: string;

  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestRequest {
  customerId: number;
  siteId: number;
  assetId: number | null;

  title: string;
  description: string | null;

  priority: string;
}