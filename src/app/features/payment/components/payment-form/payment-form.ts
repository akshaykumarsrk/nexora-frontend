import {
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import {
  PaymentRequest,
  PaymentSummary
} from '../../models/payment';

import { PaymentService } from '../../services/payment';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css'
})
export class PaymentForm {

  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly messageService = inject(MessageService);

  readonly visible = input(false);
  readonly invoiceId = input.required<number>();
  readonly invoiceNumber = input('');
  
  readonly closed = output<void>();
  readonly paymentCreated = output<void>();

  readonly summary = signal<PaymentSummary | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly paymentMethods = [
    { label: 'Cash', value: 'CASH' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'CARD' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Other', value: 'OTHER' }
  ];

  readonly form = this.fb.group({
    amount: [
      null as number | null,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    paymentMethod: [
      'UPI',
      Validators.required
    ],

    transactionReference: [
      ''
    ],

    notes: [
      ''
    ]
  });

  constructor() {
    effect(() => {
      const visible = this.visible();
      const invoiceId = this.invoiceId();

      if (visible && invoiceId > 0) {
        this.loadSummary();
      }
    });
  }

  private loadSummary(): void {
    this.loading.set(true);

    this.paymentService
      .getPaymentSummary(this.invoiceId())
      .subscribe({
        next: summary => {
          this.summary.set(summary);

          this.form.patchValue({
            amount: summary.remainingAmount > 0
              ? summary.remainingAmount
              : null
          });

          this.loading.set(false);
        },

        error: error => {
          console.error(
            'Failed to load payment summary',
            error
          );

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ??
              'Unable to load payment information'
          });
        }
      });
  }

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const summary = this.summary();

    if (!summary) {
      return;
    }

    const amount = Number(
      this.form.value.amount ?? 0
    );

    if (amount <= 0) {
      return;
    }

    if (amount > summary.remainingAmount) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Amount',
        detail:
          `Payment cannot exceed the remaining amount of ${this.formatCurrency(summary.remainingAmount)}`
      });

      return;
    }

    const request: PaymentRequest = {
      invoiceId: this.invoiceId(),
      amount,
      paymentMethod:
        this.form.value.paymentMethod ?? 'OTHER',
      transactionReference:
        this.form.value.transactionReference?.trim() || undefined,
      notes:
        this.form.value.notes?.trim() || undefined
    };

    this.saving.set(true);

    this.paymentService
      .createPayment(request)
      .subscribe({
        next: () => {

          this.saving.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Payment Recorded',
            detail: 'Payment has been recorded successfully.'
          });

          this.form.reset({
            amount: null,
            paymentMethod: 'UPI',
            transactionReference: '',
            notes: ''
          });

          this.paymentCreated.emit();
          this.closed.emit();
        },

        error: error => {

          console.error(
            'Failed to create payment',
            error
          );

          this.saving.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Payment Failed',
            detail:
              error?.error?.message ??
              'Unable to record payment'
          });
        }
      });
  }

  close(): void {
    this.closed.emit();
  }

  formatCurrency(
    amount: number | null | undefined
  ): string {

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount ?? 0);
  }
}