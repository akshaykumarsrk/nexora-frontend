import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import { Payment } from '../../models/payment';
import {
  PaymentPageResponse,
  PaymentService
} from '../../services/payment';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-payment-list',

  standalone: true,

  imports: [
    CommonModule,
    ToastModule,
    ButtonModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css'
})
export class PaymentList implements OnInit {

  /* =====================================================
     DEPENDENCIES
     ===================================================== */

  private readonly paymentService =
    inject(PaymentService);

  private readonly messageService =
    inject(MessageService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);


  /* =====================================================
     STATE
     ===================================================== */

  readonly payments =
    signal<Payment[]>([]);

  readonly loading =
    signal(false);

  readonly searchTerm =
    signal('');

  readonly invoiceFilter =
    signal<number | null>(null);

  /**
   * Backend page is zero-based.
   */
  readonly currentPage =
    signal(0);

  readonly rowsPerPage =
    signal(10);

  readonly totalElements =
    signal(0);

  readonly totalPages =
    signal(0);


  /* =====================================================
     CLIENT-SIDE SEARCH
     ===================================================== */

  /**
   * Search is currently performed on the records
   * returned for the current server page.
   *
   * Full database-level search can be added later
   * by sending the search term to the backend.
   */
  readonly filteredPayments =
  computed(() => this.payments());


  /* =====================================================
     PAGINATION DISPLAY
     ===================================================== */

  readonly paginationStart =
    computed(() => {

      const total =
        this.totalElements();

      if (total === 0) {
        return 0;
      }

      return (
        this.currentPage()
        * this.rowsPerPage()
      ) + 1;
    });


  readonly paginationEnd =
    computed(() => {

      const total =
        this.totalElements();

      if (total === 0) {
        return 0;
      }

      return Math.min(
        (
          this.currentPage() + 1
        ) * this.rowsPerPage(),
        total
      );
    });


  /* =====================================================
     PAGE NUMBERS
     ===================================================== */

  readonly pageNumbers =
    computed(() => {

      const total =
        this.totalPages();

      const current =
        this.currentPage();

      const pages: number[] = [];

      if (total <= 0) {
        return pages;
      }

      const start =
        Math.max(
          0,
          current - 2
        );

      const end =
        Math.min(
          total - 1,
          current + 2
        );

      for (
        let page = start;
        page <= end;
        page++
      ) {
        pages.push(page);
      }

      return pages;
    });


  /* =====================================================
     INITIALIZATION
     ===================================================== */

  ngOnInit(): void {

    const invoiceId =
      Number(
        this.route.snapshot
          .queryParamMap
          .get('invoiceId')
      );

    this.invoiceFilter.set(
      invoiceId > 0
        ? invoiceId
        : null
    );

    this.loadPayments();
  }


  /* =====================================================
     LOAD PAYMENTS
     ===================================================== */

  loadPayments(): void {

    this.loading.set(true);

    const page =
      this.currentPage();

    const size =
      this.rowsPerPage();

    /*
     * Normal Payments page:
     *
     * GET /api/payments/page?page=0&size=10
     *
     * If invoiceId is present, we continue using the
     * invoice-specific endpoint.
     */
    const invoiceId =
      this.invoiceFilter();

    if (invoiceId !== null) {

      this.paymentService
        .getPaymentsForInvoice(invoiceId)
        .subscribe({

          next: payments => {

            this.payments.set(
              payments ?? []
            );

            this.totalElements.set(
              payments?.length ?? 0
            );

            this.totalPages.set(
              Math.max(
                1,
                Math.ceil(
                  (payments?.length ?? 0)
                  / size
                )
              )
            );

            this.loading.set(false);
          },

          error: error => {

            this.handleLoadError(error);
          }
        });

      return;
    }

    this.paymentService
      .getPayments(page, size, this.searchTerm())
      .subscribe({

        next: (response: PaymentPageResponse) => {

          this.payments.set(
            response.content ?? []
          );

          this.totalElements.set(
            response.totalElements ?? 0
          );

          this.totalPages.set(
            response.totalPages ?? 0
          );

          this.loading.set(false);
        },

        error: error => {

          this.handleLoadError(error);
        }
      });
  }


  /* =====================================================
     LOAD ERROR
     ===================================================== */

  private handleLoadError(
    error: unknown
  ): void {

    console.error(
      'Failed to load payments',
      error
    );

    this.payments.set([]);

    this.totalElements.set(0);

    this.totalPages.set(0);

    this.loading.set(false);

    const responseError =
      error as {
        error?: {
          message?: string;
        };
      };

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail:
        responseError?.error?.message
        ??
        'Unable to load payments'
    });
  }


  /* =====================================================
     SEARCH
     ===================================================== */

  onSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(input.value);

    this.currentPage.set(0);

    this.loadPayments();
  }


  clearSearch(): void {

    this.searchTerm.set('');

    this.currentPage.set(0);

    this.loadPayments();
  }


  /* =====================================================
     PAGINATION ACTIONS
     ===================================================== */

  goToPage(page: number): void {

    if (
      page < 0 ||
      page >= this.totalPages()
    ) {
      return;
    }

    this.currentPage.set(page);

    this.loadPayments();
  }


  previousPage(): void {

    this.goToPage(
      this.currentPage() - 1
    );
  }


  nextPage(): void {

    this.goToPage(
      this.currentPage() + 1
    );
  }


  onRowsPerPageChange(
    event: Event
  ): void {

    const value =
      Number(
        (event.target as HTMLSelectElement)
          .value
      );

    if (!value) {
      return;
    }

    this.rowsPerPage.set(value);

    this.currentPage.set(0);

    this.loadPayments();
  }


  /* =====================================================
     VIEW INVOICE
     ===================================================== */

  viewInvoice(
    payment: Payment
  ): void {

    if (!payment?.invoiceId) {
      return;
    }

    this.router.navigate([
      '/invoices',
      payment.invoiceId
    ]);
  }


  /* =====================================================
     CURRENCY
     ===================================================== */

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
    ).format(
      amount ?? 0
    );
  }


  /* =====================================================
     DATE
     ===================================================== */

  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '-';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '-';
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(
      parsedDate
    );
  }


  /* =====================================================
     PAYMENT METHOD
     ===================================================== */

  formatPaymentMethod(
    method: string | null | undefined
  ): string {

    if (!method) {
      return '-';
    }

    return method
      .toLowerCase()
      .split('_')
      .map(
        word =>
          word.charAt(0).toUpperCase()
          + word.slice(1)
      )
      .join(' ');
  }


  /* =====================================================
     DOWNLOAD RECEIPT
     ===================================================== */

  downloadReceipt(
    paymentId: number
  ): void {

    this.paymentService
      .downloadReceipt(paymentId)
      .subscribe({

        next: (blob: Blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const anchor =
            document.createElement('a');

          anchor.href = url;

          anchor.download =
            `receipt-${paymentId}.pdf`;

          anchor.click();

          window.URL.revokeObjectURL(url);
        },

        error: (error: unknown) => {

          console.error(
            'Failed to download payment receipt:',
            error
          );

          this.messageService.add({
            severity: 'error',
            summary: 'Download Failed',
            detail:
              'Unable to download payment receipt.'
          });
        }
      });
  }
}