export interface Inventory {
  id: number;

  partId: number;
  partCode: string;
  partName: string;

  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;

  reorderLevel: number;

  lowStock: boolean;
  active: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface InventoryRequest {
  partId: number;
  quantity: number;
  reorderLevel: number;
}

export interface UpdateInventoryRequest {
  reorderLevel: number;
}