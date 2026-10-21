import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import { InvoiceService } from '../../services/invoice';
import { Invoice } from '../../models/invoice';

import { PaymentSummary } from '../../../payment/models/payment';
import { PaymentService } from '../../../payment/services/payment';
import { PaymentForm } from '../../../payment/components/payment-form/payment-form';


@Component({
  selector: 'app-invoice-details',
  standalone: true,

  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    ToastModule,
    PaymentForm
  ],

  providers: [
    MessageService
  ],

  templateUrl: './invoice-details.html',
  styleUrl: './invoice-details.css'
})
export class InvoiceDetails implements OnInit {

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);

  private readonly paymentService =
    inject(PaymentService);


  // =========================================================
  // STATE
  // =========================================================

  readonly invoice =
    signal<Invoice | null>(null);

  readonly loading =
    signal(false);

  readonly paymentSummary =
    signal<PaymentSummary | null>(null);

  readonly paymentDialogVisible =
    signal(false);

  readonly paymentLoading =
    signal(false);


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.goBack();
      return;
    }

    this.loadInvoice(id);
  }


  // =========================================================
  // LOAD INVOICE
  // =========================================================

  private loadInvoice(id: number): void {

    this.loading.set(true);

    this.invoiceService
      .getInvoiceById(id)
      .subscribe({

        next: invoice => {

          this.invoice.set(invoice);

          this.loading.set(false);

          this.loadPaymentData(invoice.id);
        },

        error: error => {

          console.error(
            'Failed to load invoice',
            error
          );

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ??
              'Unable to load invoice'
          });

          this.goBack();
        }
      });
  }


  // =========================================================
  // LOAD PAYMENT DATA
  // =========================================================

  loadPaymentData(invoiceId: number): void {

    this.paymentLoading.set(true);

    this.paymentService
      .getPaymentSummary(invoiceId)
      .subscribe({

        next: summary => {

          this.paymentSummary.set(summary);
          this.paymentLoading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load payment summary',
            error
          );

          this.paymentSummary.set(null);
          this.paymentLoading.set(false);
        }
      });
  }


  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/invoices'
    ]);
  }


  // =========================================================
  // VIEW JOB
  // =========================================================

  viewJob(): void {

    const invoice =
      this.invoice();

    if (!invoice) {
      return;
    }

    this.router.navigate([
      '/jobs',
      invoice.jobId
    ]);
  }


  // =========================================================
  // VIEW PAYMENTS
  // =========================================================

  viewPayments(invoiceId: number): void {

    this.router.navigate(
      ['/payments'],
      {
        queryParams: {
          invoiceId
        }
      }
    );
  }


  // =========================================================
  // STATUS
  // =========================================================

  getStatusSeverity(
    status: string
  ):
    'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (
      status?.toUpperCase()
    ) {

      case 'PAID':
        return 'success';

      case 'PARTIALLY_PAID':
        return 'info';

      case 'PENDING':
      case 'UNPAID':
        return 'warn';

      case 'OVERDUE':
      case 'CANCELLED':
      case 'VOID':
        return 'danger';

      case 'DRAFT':
        return 'secondary';

      case 'ISSUED':
        return 'info';

      default:
        return 'contrast';
    }
  }


  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  getPaymentStatusSeverity(
    status: string
  ):
    'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (
      status?.toUpperCase()
    ) {

      case 'PAID':
        return 'success';

      case 'PARTIALLY_PAID':
        return 'info';

      case 'UNPAID':
        return 'warn';

      default:
        return 'contrast';
    }
  }


  // =========================================================
  // CURRENCY
  // =========================================================

  formatCurrency(
    amount: number | null | undefined
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }
    ).format(amount ?? 0);
  }


  // =========================================================
  // DATE
  // =========================================================

  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(new Date(date));
  }


  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  downloadPdf(): void {

    const invoice =
      this.invoice();

    if (!invoice) {
      return;
    }

    this.loading.set(true);

    this.invoiceService
      .downloadInvoicePdf(invoice.id)
      .subscribe({

        next: (blob: Blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const anchor =
            document.createElement('a');

          anchor.href = url;

          anchor.download =
            `${invoice.invoiceNumber}.pdf`;

          anchor.click();

          window.URL.revokeObjectURL(url);

          this.loading.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'PDF Downloaded',
            detail:
              'Invoice PDF downloaded successfully.'
          });
        },

        error: error => {

          console.error(
            'Failed to download invoice PDF',
            error
          );

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Download Failed',
            detail:
              'Unable to download invoice PDF.'
          });
        }
      });
  }


  // =========================================================
  // RECORD PAYMENT
  // =========================================================

  recordPayment(): void {

    const summary =
      this.paymentSummary();

    if (
      !summary ||
      summary.remainingAmount <= 0
    ) {
      return;
    }

    this.paymentDialogVisible.set(true);
  }


  // =========================================================
  // AFTER PAYMENT SAVED
  // =========================================================

  onPaymentCreated(): void {

    this.paymentDialogVisible.set(false);

    const invoice =
      this.invoice();

    if (!invoice) {
      return;
    }

    // Reload invoice + payment summary
    this.loadInvoice(invoice.id);

    this.messageService.add({
      severity: 'success',
      summary: 'Payment Recorded',
      detail:
        'Payment has been recorded successfully.'
    });
  }
}