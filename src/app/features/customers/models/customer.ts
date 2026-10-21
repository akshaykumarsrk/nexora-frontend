export interface Customer {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  customerType: string;
  gstNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  name: string;
  phone?: string | null;
  email?: string | null;
  customerType: string;
  gstNumber?: string | null;
  notes?: string | null;
}