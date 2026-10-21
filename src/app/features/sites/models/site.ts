export interface Site {
  id: number;

  customerId: number;

  name: string;

  address?: string | null;

  city?: string | null;

  state?: string | null;

  pincode?: string | null;

  contactName?: string | null;

  contactPhone?: string | null;

  contactEmail?: string | null;

  notes?: string | null;

  createdAt: string;

  updatedAt: string;
}


export interface SiteRequest {
  customerId: number;

  name: string;

  address?: string | null;

  city?: string | null;

  state?: string | null;

  pincode?: string | null;

  contactName?: string | null;

  contactPhone?: string | null;

  contactEmail?: string | null;

  notes?: string | null;
}