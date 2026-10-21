export interface Asset {
  id: number;

  siteId: number;

  assetCode: string;
  name: string;

  category?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;

  installationDate?: string | null;
  warrantyEndDate?: string | null;

  status: string;

  notes?: string | null;

  createdAt: string;
  updatedAt: string;
}


export interface AssetRequest {
  siteId: number;

  assetCode: string;
  name: string;

  category?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;

  installationDate?: string | null;
  warrantyEndDate?: string | null;

  status: string;

  notes?: string | null;
}