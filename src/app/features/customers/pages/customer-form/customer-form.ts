import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import {
  Customer,
  CustomerRequest
} from '../../models/customer';

import { CustomerService } from '../../services/customer';


@Component({
  selector: 'app-customer-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './customer-form.html',

  styleUrl: './customer-form.css'
})
export class CustomerForm implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly customerService =
    inject(CustomerService);

  private readonly messageService =
    inject(MessageService);


  /*
   * Reactive forms are objects managed by Angular's
   * Reactive Forms API, so we keep the FormGroup itself
   * as a normal form object.
   */
  customerForm!: FormGroup;


  /*
   * Signal state
   */
  readonly customer =
    signal<Customer | null>(null);

  readonly editing =
    signal(false);

  readonly loading =
    signal(false);

  readonly saving =
    signal(false);

  readonly customerId =
    signal<number | null>(null);


  /*
   * Customer type options
   */
  readonly customerTypeOptions =
    signal([
      {
        label: 'Individual',
        value: 'INDIVIDUAL'
      },
      {
        label: 'Business',
        value: 'BUSINESS'
      }
    ]);


  ngOnInit(): void {

    this.buildForm();

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      const customerId =
        Number(id);

      this.editing.set(true);

      this.customerId.set(customerId);

      this.loadCustomer(customerId);
    }
  }


  private buildForm(): void {

    this.customerForm =
      this.fb.group({

        name: [
          '',
          [
            Validators.required,
            Validators.maxLength(150)
          ]
        ],

        phone: [
          '',
          [
            Validators.pattern(
              /^[0-9]{10}$/
            )
          ]
        ],

        email: [
          '',
          [
            Validators.email
          ]
        ],

        customerType: [
          null,
          [
            Validators.required
          ]
        ],

        gstNumber: [
          '',
          [
            Validators.maxLength(20)
          ]
        ],

        notes: [
          '',
          [
            Validators.maxLength(1000)
          ]
        ]

      });
  }


  private loadCustomer(id: number): void {

    this.loading.set(true);

    this.customerService
      .getCustomerById(id)
      .subscribe({

        next: (customer) => {

          this.customer.set(customer);

          this.customerForm.patchValue({

            name: customer.name,

            phone:
              customer.phone ?? '',

            email:
              customer.email ?? '',

            customerType:
              customer.customerType,

            gstNumber:
              customer.gstNumber ?? '',

            notes:
              customer.notes ?? ''

          });

          this.loading.set(false);
        },


        error: (error) => {

          console.error(
            'Failed to load customer:',
            error
          );

          this.loading.set(false);

          this.showError(
            'Unable to load customer.'
          );

          this.router.navigate([
            '/customers'
          ]);
        }

      });
  }


  onSubmit(): void {

    if (this.customerForm.invalid) {

      this.customerForm.markAllAsTouched();

      return;
    }

    this.saving.set(true);

    const request =
      this.customerForm
        .getRawValue() as CustomerRequest;


    if (this.editing()) {

      this.updateCustomer(request);

    } else {

      this.createCustomer(request);
    }
  }


  private createCustomer(
    request: CustomerRequest
  ): void {

    this.customerService
      .createCustomer(request)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.messageService.add({

            severity: 'success',

            summary:
              'Customer Created',

            detail:
              'Customer created successfully.'

          });

          this.router.navigate([
            '/customers'
          ]);
        },


        error: (error) => {

          console.error(
            'Failed to create customer:',
            error
          );

          this.saving.set(false);

          this.showError(
            this.getErrorMessage(
              error,
              'Unable to create customer.'
            )
          );
        }

      });
  }


  private updateCustomer(
    request: CustomerRequest
  ): void {

    const id =
      this.customerId();

    if (id === null) {

      this.saving.set(false);

      return;
    }

    this.customerService
      .updateCustomer(
        id,
        request
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.messageService.add({

            severity: 'success',

            summary:
              'Customer Updated',

            detail:
              'Customer updated successfully.'

          });

          this.router.navigate([
            '/customers'
          ]);
        },


        error: (error) => {

          console.error(
            'Failed to update customer:',
            error
          );

          this.saving.set(false);

          this.showError(
            this.getErrorMessage(
              error,
              'Unable to update customer.'
            )
          );
        }

      });
  }


  onCancel(): void {

    this.router.navigate([
      '/customers'
    ]);
  }


  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.customerForm.get(
        controlName
      );

    return !!(
      control &&
      control.invalid &&
      control.touched
    );
  }


  getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    const response =
      error as {
        error?: {
          errors?: Record<string, string>;
          message?: string;
        };
      };


    if (
      response?.error?.errors &&
      typeof response.error.errors === 'object'
    ) {

      const messages =
        Object.values(
          response.error.errors
        );

      if (messages.length > 0) {

        return messages[0];
      }
    }


    if (response?.error?.message) {

      return response.error.message;
    }


    return fallback;
  }


  private showError(
    message: string
  ): void {

    this.messageService.add({

      severity: 'error',

      summary: 'Error',

      detail: message

    });
  }
}