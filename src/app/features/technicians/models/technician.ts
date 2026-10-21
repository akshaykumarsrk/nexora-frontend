export interface Technician {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  employeeCode: string | null;
  specialization: string | null;
  status: string;
  notes: string | null;
  hasLoginAccount?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianRequest {
  name: string;
  phone: string;
  email?: string | null;
  employeeCode?: string | null;
  specialization?: string | null;
  status: string;
  notes?: string | null;
}