export interface StockMovement {}
export type MovementType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'ADJUSTMENT';

export interface StockMovement {
  id: number;

  inventoryId: number;
  partId: number;

  partCode: string;
  partName: string;

  movementType: MovementType;

  quantity: number;
  quantityBefore: number;
  quantityAfter: number;

  reason?: string | null;

  jobId?: number | null;
  technicianId?: number | null;

  createdAt: string;
}

export interface StockMovementRequest {
  inventoryId: number;
  movementType: MovementType;

  quantity: number;

  reason?: string | null;

  jobId?: number | null;
  technicianId?: number | null;
}