export interface Payment {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string | null;
  notes?: string | null;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  notes?: string;
}

export interface PaymentSummary {
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
}