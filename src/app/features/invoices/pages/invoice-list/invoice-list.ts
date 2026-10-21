import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { MessageService } from 'primeng/api';

import { InvoiceService } from '../../services/invoice';
import { Invoice } from '../../models/invoice';

@Component({
  selector: 'app-invoice-list',
  standalone: true,

  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    TooltipModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css'
})
export class InvoiceList implements OnInit {

  private readonly invoiceService = inject(InvoiceService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // =========================================================
  // STATE
  // =========================================================

  readonly invoices = signal<Invoice[]>([]);
  readonly loading = signal(false);
  readonly searchTerm = signal('');

  // =========================================================
  // FILTERED INVOICES
  // =========================================================

  readonly filteredInvoices = computed(() => {

    const invoices = this.invoices();

    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    if (!search) {
      return invoices;
    }

    return invoices.filter(invoice =>
      invoice.invoiceNumber
        ?.toLowerCase()
        .includes(search)

      ||

      invoice.jobNumber
        ?.toLowerCase()
        .includes(search)

      ||

      invoice.customerName
        ?.toLowerCase()
        .includes(search)

      ||

      invoice.status
        ?.toLowerCase()
        .includes(search)
    );
  });

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadInvoices();
  }

  // =========================================================
  // LOAD INVOICES
  // =========================================================

  loadInvoices(): void {

    this.loading.set(true);

    this.invoiceService.getAllInvoices().subscribe({

      next: invoices => {

        this.invoices.set(invoices ?? []);
        this.loading.set(false);
      },

      error: error => {

        console.error('Failed to load invoices', error);

        this.loading.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            error?.error?.message ??
            'Unable to load invoices'
        });
      }
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }

  // =========================================================
  // VIEW INVOICE
  // =========================================================

  viewInvoice(invoice: Invoice): void {

    this.router.navigate([
      '/invoices',
      invoice.id
    ]);
  }

  // =========================================================
  // CREATE INVOICE
  // =========================================================

  createInvoice(): void {

    this.router.navigate([
      '/invoices',
      'create'
    ]);
  }

  // =========================================================
  // STATUS SEVERITY
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

    switch (status?.toUpperCase()) {

      case 'PAID':
        return 'success';

      case 'PARTIALLY_PAID':
        return 'info';

      case 'PENDING':
      case 'UNPAID':
        return 'warn';

      case 'OVERDUE':
      case 'CANCELLED':
        return 'danger';

      case 'DRAFT':
        return 'secondary';

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
}