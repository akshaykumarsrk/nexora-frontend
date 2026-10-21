import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ButtonModule
} from 'primeng/button';

import {
  CardModule
} from 'primeng/card';

import {
  InputNumberModule
} from 'primeng/inputnumber';

import {
  DatePickerModule
} from 'primeng/datepicker';

import {
  MessageService
} from 'primeng/api';

import {
  ToastModule
} from 'primeng/toast';

import {
  InvoiceService
} from '../../services/invoice';

import {
  Invoice
} from '../../models/invoice';


@Component({
  selector: 'app-invoice-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    DatePickerModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.css'
})
export class InvoiceCreate implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly invoiceService =
    inject(InvoiceService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);


  // =========================================================
  // STATE
  // =========================================================

  readonly loading =
    signal(false);

  readonly invoice =
    signal<Invoice | null>(null);

  readonly editMode =
    signal(false);

  readonly jobId =
    signal<number | null>(null);


  // =========================================================
  // FORM
  // =========================================================

  readonly invoiceForm =
    this.fb.nonNullable.group({

      jobId: [
        0,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      labourAmount: [
        0,
        [
          Validators.min(0)
        ]
      ],

      otherCharges: [
        0,
        [
          Validators.min(0)
        ]
      ],

      discount: [
        0,
        [
          Validators.min(0)
        ]
      ],

      taxPercentage: [
        18,
        [
          Validators.min(0),
          Validators.max(100)
        ]
      ],

      dueDate: [
        null as Date | null
      ]

    });


  // =========================================================
  // CALCULATIONS
  // =========================================================

  readonly labourAmount =
    signal(0);

  readonly partsAmount =
    signal(0);

  readonly otherCharges =
    signal(0);

  readonly discount =
    signal(0);

  readonly taxPercentage =
    signal(18);


  readonly subtotal = computed(() => {

    return Math.max(
      0,

      this.labourAmount()
      +
      this.partsAmount()
      +
      this.otherCharges()
      -
      this.discount()
    );

  });


  readonly taxAmount = computed(() => {

    return (
      this.subtotal()
      *
      this.taxPercentage()
    ) / 100;

  });


  readonly totalAmount = computed(() => {

    return (
      this.subtotal()
      +
      this.taxAmount()
    );

  });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    const queryJobId =
      Number(
        this.route.snapshot.queryParamMap.get('jobId')
      );


    /*
     * EDIT MODE
     */

    if (id) {

      this.editMode.set(true);

      this.loadInvoice(id);

      return;
    }


    /*
     * CREATE MODE
     */

    if (queryJobId) {

      this.jobId.set(queryJobId);

      this.invoiceForm.patchValue({
        jobId: queryJobId
      });

    }

  }


  // =========================================================
  // LOAD INVOICE
  // =========================================================

  private loadInvoice(
    id: number
  ): void {

    this.loading.set(true);

    this.invoiceService
      .getInvoiceById(id)
      .subscribe({

        next: (invoice) => {

          this.invoice.set(invoice);

          this.jobId.set(
            invoice.jobId
          );

          /*
           * Populate form
           */

          this.invoiceForm.patchValue({

            jobId:
              invoice.jobId,

            labourAmount:
              invoice.labourAmount,

            otherCharges:
              invoice.otherCharges,

            discount:
              invoice.discount,

            dueDate:
              invoice.dueDate
                ? new Date(invoice.dueDate)
                : null

          });


          /*
           * Populate calculated values
           */

          this.labourAmount.set(
            invoice.labourAmount
          );

          this.partsAmount.set(
            invoice.partsAmount
          );

          this.otherCharges.set(
            invoice.otherCharges
          );

          this.discount.set(
            invoice.discount
          );

          this.loading.set(false);

        },

        error: (error) => {

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ||
              'Unable to load invoice'
          });

        }

      });

  }


  // =========================================================
  // FORM VALUE CHANGES
  // =========================================================

  updateCalculations(): void {

    const value =
      this.invoiceForm.getRawValue();


    this.labourAmount.set(
      value.labourAmount ?? 0
    );

    this.otherCharges.set(
      value.otherCharges ?? 0
    );

    this.discount.set(
      value.discount ?? 0
    );

    this.taxPercentage.set(
      value.taxPercentage ?? 0
    );

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    if (
      this.invoiceForm.invalid
    ) {

      this.invoiceForm.markAllAsTouched();

      return;
    }


    const value =
      this.invoiceForm.getRawValue();


    const request = {

      jobId:
        value.jobId,

      labourAmount:
        value.labourAmount || 0,

      otherCharges:
        value.otherCharges || 0,

      discount:
        value.discount || 0,

      taxPercentage:
        value.taxPercentage || 0,

      dueDate:
        value.dueDate
          ? this.formatDateForApi(
              value.dueDate
            )
          : undefined

    };


    this.loading.set(true);


    /*
     * CREATE
     */

    if (!this.editMode()) {

      this.invoiceService
        .createInvoice(request)
        .subscribe({

          next: (invoice) => {

            this.loading.set(false);

            this.messageService.add({
              severity: 'success',
              summary: 'Invoice Created',
              detail:
                `Invoice ${invoice.invoiceNumber} created successfully`
            });


            this.router.navigate([
              '/invoices',
              invoice.id
            ]);

          },

          error: (error) => {

            this.loading.set(false);

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                error?.error?.message ||
                'Unable to create invoice'
            });

          }

        });

      return;
    }


    /*
     * EDIT
     *
     * Your current InvoiceService does not
     * have updateInvoice(), so editing is
     * intentionally not submitted yet.
     */

    this.messageService.add({
      severity: 'info',
      summary: 'Edit',
      detail:
        'Invoice update API is not available yet.'
    });

    this.loading.set(false);

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
  // DATE
  // =========================================================

  private formatDateForApi(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }


  // =========================================================
  // CURRENCY
  // =========================================================

  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }
    ).format(amount);

  }

}