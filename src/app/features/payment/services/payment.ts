import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  Payment,
  PaymentRequest,
  PaymentSummary
} from '../models/payment';

export interface PaymentPageResponse {
  content: Payment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/payments`;

  // =========================================================
  // CREATE PAYMENT
  // =========================================================

  createPayment(
    request: PaymentRequest
  ): Observable<Payment> {

    return this.http.post<Payment>(
      this.apiUrl,
      request
    );
  }

  // =========================================================
  // PAGINATED PAYMENTS
  // =========================================================

  getPayments(
    page: number,
    size: number,
    search: string = ''
  ): Observable<PaymentPageResponse> {

    return this.http.get<PaymentPageResponse>(
      `${this.apiUrl}/page`,
      {
        params: {
          page: page.toString(),
          size: size.toString(),
          search: search.trim()
        }
      }
    );
  }

  // =========================================================
  // PAYMENTS FOR INVOICE
  // =========================================================

  getPaymentsForInvoice(
    invoiceId: number
  ): Observable<Payment[]> {

    return this.http.get<Payment[]>(
      `${this.apiUrl}/invoice/${invoiceId}`
    );
  }

  // =========================================================
  // PAYMENT SUMMARY
  // =========================================================

  getPaymentSummary(
    invoiceId: number
  ): Observable<PaymentSummary> {

    return this.http.get<PaymentSummary>(
      `${this.apiUrl}/invoice/${invoiceId}/summary`
    );
  }

  // =========================================================
  // DOWNLOAD PAYMENT RECEIPT
  // =========================================================

  downloadReceipt(
    paymentId: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/${paymentId}/receipt`,
      {
        responseType: 'blob'
      }
    );
  }
}