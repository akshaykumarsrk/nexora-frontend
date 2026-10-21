export interface Part {
  id: number;
  partCode: string;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string | null;
  active: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartRequest {
  partCode: string;
  name: string;
  category?: string | null;
  brand?: string | null;
  unit?: string | null;
  description?: string | null;
}