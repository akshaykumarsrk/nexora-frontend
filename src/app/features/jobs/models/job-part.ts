export interface JobPart {

  id: number;

  organizationId?: number;

  jobId: number;

  partId: number;

  technicianId: number;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  notes?: string;

  createdAt?: string;

  // Display information returned by backend
  partCode?: string;
  partName?: string;

  technicianName?: string;
}


export interface JobPartRequest {

  jobId: number;

  partId: number;

  technicianId: number;

  quantity: number;

  unitPrice: number;

  notes?: string;
}