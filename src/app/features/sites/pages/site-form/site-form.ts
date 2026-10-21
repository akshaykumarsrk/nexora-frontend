import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

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
  Site,
  SiteRequest
} from '../../models/site';

import {
  SiteService
} from '../../services/sites';

import {
  Customer
} from '../../../customers/models/customer';

import {
  CustomerService
} from '../../../customers/services/customer';


@Component({
  selector: 'app-site-form',

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

  templateUrl: './site-form.html',

  styleUrl: './site-form.css'
})
export class SiteForm implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly siteService =
    inject(SiteService);

  private readonly customerService =
    inject(CustomerService);

  private readonly messageService =
    inject(MessageService);


  /* =====================================================
     STATE
     ===================================================== */

  readonly site =
    signal<Site | null>(null);

  readonly customers =
    signal<Customer[]>([]);

  readonly editing =
    signal(false);

  readonly loading =
    signal(false);

  readonly customersLoading =
    signal(false);

  readonly saving =
    signal(false);


  readonly siteId =
    signal<number | null>(null);


  /* =====================================================
     FORM
     ===================================================== */

  siteForm!: FormGroup;


  /* =====================================================
     CUSTOMER OPTIONS
     ===================================================== */

  readonly customerOptions =
    signal<
      {
        label: string;
        value: number;
      }[]
    >([]);


  /* =====================================================
     INIT
     ===================================================== */

  ngOnInit(): void {

    this.buildForm();

    this.loadCustomers();


    const id =
      this.route.snapshot.paramMap.get('id');


    if (id) {

      const siteId =
        Number(id);

      this.editing.set(true);

      this.siteId.set(siteId);

      this.loadSite(siteId);
    }
  }


  /* =====================================================
     BUILD FORM
     ===================================================== */

  private buildForm(): void {

    this.siteForm =
      this.fb.group({

        customerId: [
          null,
          Validators.required
        ],

        name: [
          '',
          [
            Validators.required,
            Validators.maxLength(150)
          ]
        ],

        address: [
          '',
          [
            Validators.maxLength(500)
          ]
        ],

        city: [
          '',
          [
            Validators.maxLength(100)
          ]
        ],

        state: [
          '',
          [
            Validators.maxLength(100)
          ]
        ],

        pincode: [
          '',
          [
            Validators.pattern(/^[0-9]{6}$/)
          ]
        ],

        contactName: [
          '',
          [
            Validators.maxLength(150)
          ]
        ],

        contactPhone: [
          '',
          [
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],

        contactEmail: [
          '',
          [
            Validators.email
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


  /* =====================================================
     LOAD CUSTOMERS
     ===================================================== */

  private loadCustomers(): void {

    this.customersLoading.set(true);


    this.customerService
      .getAllCustomers()
      .subscribe({

        next: customers => {

          this.customers.set(
            customers
          );


          this.customerOptions.set(

            customers.map(customer => ({

              label: customer.name,

              value: customer.id

            }))

          );


          this.customersLoading.set(false);
        },


        error: error => {

          console.error(
            'Failed to load customers:',
            error
          );


          this.customersLoading.set(false);


          this.showError(
            'Unable to load customers.'
          );
        }

      });
  }


  /* =====================================================
     LOAD SITE
     ===================================================== */

  private loadSite(
    id: number
  ): void {

    this.loading.set(true);


    this.siteService
      .getSiteById(id)
      .subscribe({

        next: site => {

          this.site.set(site);


          this.siteForm.patchValue({

            customerId:
              site.customerId,

            name:
              site.name,

            address:
              site.address ?? '',

            city:
              site.city ?? '',

            state:
              site.state ?? '',

            pincode:
              site.pincode ?? '',

            contactName:
              site.contactName ?? '',

            contactPhone:
              site.contactPhone ?? '',

            contactEmail:
              site.contactEmail ?? '',

            notes:
              site.notes ?? ''

          });


          this.loading.set(false);
        },


        error: error => {

          console.error(
            'Failed to load site:',
            error
          );


          this.loading.set(false);


          this.showError(
            'Unable to load site.'
          );


          this.router.navigate([
            '/sites'
          ]);
        }

      });
  }


  /* =====================================================
     SUBMIT
     ===================================================== */

  onSubmit(): void {

    if (
      this.siteForm.invalid
    ) {

      this.siteForm.markAllAsTouched();

      return;
    }


    this.saving.set(true);


    const request:
      SiteRequest =
      this.siteForm.getRawValue();


    if (
      this.editing() &&
      this.siteId() !== null
    ) {

      this.updateSite(request);

    } else {

      this.createSite(request);
    }
  }


  /* =====================================================
     CREATE
     ===================================================== */

  private createSite(
    request: SiteRequest
  ): void {

    this.siteService
      .createSite(request)
      .subscribe({

        next: () => {

          this.saving.set(false);


          this.messageService.add({

            severity: 'success',

            summary: 'Site Created',

            detail:
              'Site created successfully.'

          });


          this.router.navigate([
            '/sites'
          ]);
        },


        error: error => {

          console.error(
            'Failed to create site:',
            error
          );


          this.saving.set(false);


          this.showError(
            this.getErrorMessage(
              error,
              'Unable to create site.'
            )
          );
        }

      });
  }


  /* =====================================================
     UPDATE
     ===================================================== */

  private updateSite(
    request: SiteRequest
  ): void {

    const id =
      this.siteId();


    if (id === null) {

      return;
    }


    this.siteService
      .updateSite(
        id,
        request
      )
      .subscribe({

        next: () => {

          this.saving.set(false);


          this.messageService.add({

            severity: 'success',

            summary: 'Site Updated',

            detail:
              'Site updated successfully.'

          });


          this.router.navigate([
            '/sites'
          ]);
        },


        error: error => {

          console.error(
            'Failed to update site:',
            error
          );


          this.saving.set(false);


          this.showError(
            this.getErrorMessage(
              error,
              'Unable to update site.'
            )
          );
        }

      });
  }


  /* =====================================================
     CANCEL
     ===================================================== */

  onCancel(): void {

    this.router.navigate([
      '/sites'
    ]);
  }


  /* =====================================================
     VALIDATION
     ===================================================== */

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.siteForm.get(
        controlName
      );


    return !!(
      control &&
      control.invalid &&
      control.touched
    );
  }


  /* =====================================================
     ERROR MESSAGE
     ===================================================== */

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error?.errors &&
      typeof error.error.errors === 'object'
    ) {

      const messages =
        Object.values(
          error.error.errors
        ) as string[];


      if (
        messages.length > 0
      ) {

        return messages[0];
      }
    }


    if (
      error?.error?.message
    ) {

      return error.error.message;
    }


    return fallback;
  }


  /* =====================================================
     ERROR TOAST
     ===================================================== */

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