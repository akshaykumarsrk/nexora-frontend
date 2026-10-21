export interface Brand { id: number; name: string; description?: string | null; active?: boolean | null; createdAt?: string; updatedAt?: string; }
export interface BrandRequest { name: string; description?: string; active: boolean; }
export interface EquipmentModel { id: number; brandId: number; brandName?: string; productType: string; modelNumber: string; description?: string | null; active?: boolean | null; createdAt?: string; updatedAt?: string; }
export interface EquipmentModelRequest { brandId: number; productType: string; modelNumber: string; description?: string; active: boolean; }
