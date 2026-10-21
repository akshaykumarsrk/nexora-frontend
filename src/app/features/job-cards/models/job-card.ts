export interface JobCard {

  id: number;

  jobId: number;

  technicianId: number;

  problemReported: string | null;

  diagnosis: string | null;

  workPerformed: string | null;

  findings: string | null;

  technicianRemarks: string | null;

  customerRemarks: string | null;

  customerAcknowledged: boolean;

  acknowledgedAt: string | null;

  createdAt: string;

  updatedAt: string;
}


export interface JobCardRequest {

  jobId: number;

  problemReported?: string;

  diagnosis?: string;

  workPerformed?: string;

  findings?: string;

  technicianRemarks?: string;

  customerRemarks?: string;
}