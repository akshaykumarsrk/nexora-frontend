export interface Invoice {
  id: number;

  jobId: number;
  jobNumber: string;

  customerId: number;
  customerName: string;

  invoiceNumber: string;

  labourAmount: number;
  partsAmount: number;
  otherCharges: number;
  discount: number;

  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  status: string;
  paymentStatus: string;

  issuedAt: string | null;
  dueDate: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRequest {
  jobId: number;

  labourAmount?: number;
  otherCharges?: number;
  discount?: number;

  taxPercentage?: number;

  dueDate?: string;
}