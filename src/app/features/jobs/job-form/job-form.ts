import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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

import {
  MessageService
} from 'primeng/api';

import {
  ButtonModule
} from 'primeng/button';

import {
  CardModule
} from 'primeng/card';

import {
  SelectModule
} from 'primeng/select';

import {
  DatePickerModule
} from 'primeng/datepicker';

import {
  InputTextModule
} from 'primeng/inputtext';

import {
  TextareaModule
} from 'primeng/textarea';

import {
  ToastModule
} from 'primeng/toast';

import {
  JobService
} from '../../../features/jobs/services/job';

import {
  Job
} from '../../../features/jobs/models/job';

import {
  JobRequest
} from '../../../features/jobs/models/job-request';

import {
  ServiceRequestService
} from '../../../features/service-requests/services/service-request';

import {
  ServiceRequest
} from '../../../features/service-requests/models/service-request';

import {
  SiteService
} from '../../../features/sites/services/sites';

import {
  TechnicianService
} from '../../../features/technicians/services/technician';

import {
  Technician
} from '../../../features/technicians/models/technician';

@Component({
  selector: 'app-job-form',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    TextareaModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './job-form.html',
  styleUrl: './job-form.css'
})
export class JobForm implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly fb =
    inject(FormBuilder);

  private readonly jobService =
    inject(JobService);

  private readonly serviceRequestService =
    inject(ServiceRequestService);

  private readonly siteService =
    inject(SiteService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);

  private readonly technicianService =
    inject(TechnicianService);


  // =========================================================
  // FORM
  // =========================================================

  jobForm!: FormGroup;


  // =========================================================
  // STATE
  // =========================================================

  isEditMode = false;

  jobId: number | null = null;

  readonly loading =
    signal(false);

  submitting = false;

  job: Job | null = null;


  // =========================================================
  // DROPDOWN DATA
  // =========================================================

  serviceRequests: ServiceRequest[] = [];

  customers: any[] = [];

  sites: any[] = [];

  assets: any[] = [];

  technicians: Technician[] = [];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.initializeForm();

    // ---------------------------------------------------------
    // Determine edit mode
    // ---------------------------------------------------------

    this.isEditMode =
      this.route.snapshot.url.some(
        segment => segment.path === 'edit'
      );


    // ---------------------------------------------------------
    // Get Job ID
    // ---------------------------------------------------------

    const currentRouteId =
      this.route.snapshot.paramMap.get('id');

    const parentRouteId =
      this.route.parent?.snapshot.paramMap.get('id');

    const id =
      currentRouteId ?? parentRouteId;

    this.jobId =
      id ? Number(id) : null;


    // ---------------------------------------------------------
    // Load dropdown data
    // ---------------------------------------------------------

    this.loadServiceRequests();

    this.loadTechnicians();


    // ---------------------------------------------------------
    // Edit mode
    // ---------------------------------------------------------

    if (
      this.isEditMode &&
      this.jobId &&
      Number.isInteger(this.jobId) &&
      this.jobId > 0
    ) {

      this.loadJob(this.jobId);

    } else if (this.isEditMode) {

      this.showError(
        'Invalid Job ID.'
      );

    }

  }

  private loadTechnicians(): void {

  this.technicianService
    .getAllTechnicians()
    .subscribe({

      next: (technicians) => {

        this.technicians =
          technicians ?? [];

      },

      error: (error) => {

        console.error(
          'Failed to load technicians',
          error
        );

        this.technicians = [];

        this.showError(
          'Unable to load technicians'
        );

      }

    });
}


  // =========================================================
  // FORM INITIALIZATION
  // =========================================================

  private initializeForm(): void {

    this.jobForm =
      this.fb.group({

        serviceRequestId: [
          null,
          Validators.required
        ],

        customerId: [
          null,
          Validators.required
        ],

        siteId: [
          null,
          Validators.required
        ],

        assetId: [
          null
        ],

        technicianId: [
          null
        ],

        scheduledAt: [
          null
        ],

        notes: [
          null
        ],

        workSummary: [
          null
        ]
      });


    // ---------------------------------------------------------
    // Service Request Selection
    // ---------------------------------------------------------

    this.jobForm
      .get('serviceRequestId')
      ?.valueChanges
      .subscribe((serviceRequestId) => {

        if (!serviceRequestId) {

          this.customers = [];
          this.sites = [];
          this.assets = [];

          this.jobForm.patchValue(
            {
              customerId: null,
              siteId: null,
              assetId: null
            },
            {
              emitEvent: false
            }
          );

          return;
        }

        this.handleServiceRequestSelection(
          Number(serviceRequestId)
        );
      });
  }


  // =========================================================
  // LOAD SERVICE REQUESTS
  // =========================================================

  private loadServiceRequests(): void {

    this.serviceRequestService
      .getAllServiceRequests()
      .subscribe({

        next: (requests) => {

          this.serviceRequests =
            requests ?? [];


          // ---------------------------------------------------
          // If editing, load related data after SRs arrive
          // ---------------------------------------------------

          if (
            this.isEditMode &&
            this.job
          ) {

            const serviceRequestId =
              this.job.serviceRequestId;

            if (
              serviceRequestId !== undefined &&
              serviceRequestId !== null
            ) {

              this.setupRelatedData(
                serviceRequestId
              );
            }
          }
        },

        error: (error) => {

          console.error(
            'Failed to load service requests',
            error
          );

          this.serviceRequests = [];

          this.showError(
            'Unable to load service requests'
          );
        }
      });
  }


  // =========================================================
  // SERVICE REQUEST SELECTED
  // =========================================================

  private handleServiceRequestSelection(
    serviceRequestId: number
  ): void {

    const serviceRequest =
      this.serviceRequests.find(
        request =>
          request.id === serviceRequestId
      );

    if (!serviceRequest) {

      return;
    }


    this.setupRelatedData(
      serviceRequestId
    );
  }


  // =========================================================
  // SETUP CUSTOMER / SITE / ASSET
  // =========================================================

  private setupRelatedData(
    serviceRequestId: number
  ): void {

    const serviceRequest =
      this.serviceRequests.find(
        request =>
          request.id === serviceRequestId
      );

    if (!serviceRequest) {

      return;
    }


    // =======================================================
    // CUSTOMER
    // =======================================================
    //
    // Customer service does not exist yet.
    //
    // Therefore we temporarily create one option using
    // customerId from ServiceRequest.
    //
    // Later, when CustomerService is created, replace this
    // with actual customer data.
    // =======================================================

    this.customers = [

      {
        id: serviceRequest.customerId,

        name:
          `Customer #${serviceRequest.customerId}`
      }

    ];


    this.jobForm.patchValue(
      {
        customerId:
          serviceRequest.customerId
      },
      {
        emitEvent: false
      }
    );


    // =======================================================
    // SITE
    // =======================================================

    this.loadSites(
      serviceRequest.customerId,
      serviceRequest.siteId
    );


    // =======================================================
    // ASSET
    // =======================================================

    if (
      serviceRequest.assetId
    ) {

      this.assets = [

        {
          id: serviceRequest.assetId,

          name:
            `Asset #${serviceRequest.assetId}`
        }

      ];

      this.jobForm.patchValue(
        {
          assetId:
            serviceRequest.assetId
        },
        {
          emitEvent: false
        }
      );

    } else {

      this.assets = [];

      this.jobForm.patchValue(
        {
          assetId: null
        },
        {
          emitEvent: false
        }
      );
    }
  }


  // =========================================================
  // LOAD SITES
  // =========================================================

  private loadSites(
    customerId: number,
    selectedSiteId?: number
  ): void {

    this.siteService
      .getSitesByCustomer(customerId)
      .subscribe({

        next: (sites) => {

          this.sites =
            sites ?? [];


          // ---------------------------------------------------
          // Select site from service request
          // ---------------------------------------------------

          if (
            selectedSiteId &&
            this.sites.some(
              site =>
                site.id === selectedSiteId
            )
          ) {

            this.jobForm.patchValue(
              {
                siteId: selectedSiteId
              },
              {
                emitEvent: false
              }
            );
          }
        },

        error: (error) => {

          console.error(
            'Failed to load sites',
            error
          );

          this.sites = [];

          this.showError(
            'Unable to load sites'
          );
        }
      });
  }


  // =========================================================
  // LOAD JOB
  // =========================================================

  private loadJob(
    id: number
  ): void {

    this.loading.set(true);

    this.jobService
      .getJobById(id)
      .subscribe({

        next: (job) => {

          this.job = job;


          this.jobForm.patchValue({

            serviceRequestId:
              job.serviceRequestId,

            customerId:
              job.customerId,

            siteId:
              job.siteId,

            assetId:
              job.assetId ?? null,

            technicianId:
              job.technicianId ?? null,

            scheduledAt:
              job.scheduledAt
                ? new Date(job.scheduledAt)
                : null,

            notes:
              job.notes ?? null,

            workSummary:
              job.workSummary ?? null

          });


          this.loading.set(false);


          // ---------------------------------------------------
          // Service request may not have loaded yet.
          // loadServiceRequests() will call setupRelatedData
          // once requests are available.
          // ---------------------------------------------------

          if (
            this.serviceRequests.length > 0
          ) {

            const serviceRequestId =
              job.serviceRequestId;

            if (
              serviceRequestId !== undefined &&
              serviceRequestId !== null
            ) {

              this.setupRelatedData(
                serviceRequestId
              );
            }
          }
        },

        error: (error) => {

          console.error(
            'Failed to load job for editing:',
            error
          );

          this.loading.set(false);

          this.showError(
            error?.error?.message ||
            'Unable to load job'
          );
        }
      });
  }


  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    if (
      this.jobForm.invalid
    ) {

      this.jobForm.markAllAsTouched();

      this.showError(
        'Please fill all required fields'
      );

      return;
    }


    const formValue =
      this.jobForm.getRawValue();


    const request: JobRequest = {

      serviceRequestId:
        formValue.serviceRequestId,

      customerId:
        formValue.customerId,

      siteId:
        formValue.siteId,

      assetId:
        formValue.assetId ?? null,

      technicianId:
        formValue.technicianId ?? null,

      scheduledAt:
        this.formatDate(
          formValue.scheduledAt
        ) ?? undefined,

      notes:
        formValue.notes ?? null,

      workSummary:
        formValue.workSummary ?? undefined
    };


    this.submitting = true;


    if (
      this.isEditMode &&
      this.jobId
    ) {

      this.updateJob(
        this.jobId,
        request
      );

    } else {

      this.createJob(
        request
      );
    }
  }


  // =========================================================
  // CREATE
  // =========================================================

  private createJob(
    request: JobRequest
  ): void {

    this.jobService
      .createJob(request)
      .subscribe({

        next: (job) => {

          this.submitting = false;

          this.showSuccess(
            `Job ${job.jobNumber} created successfully`
          );

          setTimeout(() => {

            this.router.navigate([
              '/jobs',
              job.id
            ]);

          }, 500);
        },

        error: (error) => {

          this.submitting = false;

          this.showError(
            error?.error?.message ||
            'Unable to create job'
          );
        }
      });
  }


  // =========================================================
  // UPDATE
  // =========================================================

  private updateJob(
    id: number,
    request: JobRequest
  ): void {

    this.jobService
      .updateJob(
        id,
        request
      )
      .subscribe({

        next: () => {

          this.submitting = false;

          this.showSuccess(
            'Job updated successfully'
          );

          setTimeout(() => {

            this.router.navigate([
              '/jobs',
              id
            ]);

          }, 500);
        },

        error: (error) => {

          this.submitting = false;

          this.showError(
            error?.error?.message ||
            'Unable to update job'
          );
        }
      });
  }


  // =========================================================
  // DATE FORMAT
  // =========================================================

  private formatDate(
    value: Date | string | null
  ): string | null {

    if (!value) {

      return null;
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;
    }

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

    const hours =
      String(
        date.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');

    const seconds =
      String(
        date.getSeconds()
      ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }


  // =========================================================
  // CANCEL
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/jobs'
    ]);
  }


  // =========================================================
  // SUCCESS
  // =========================================================

  private showSuccess(
    message: string
  ): void {

    this.messageService.add({

      severity: 'success',

      summary: 'Success',

      detail: message

    });
  }


  // =========================================================
  // ERROR
  // =========================================================

  private showError(
    message: string
  ): void {

    this.messageService.add({

      severity: 'error',

      summary: 'Error',

      detail: message

    });
  }


  // =========================================================
  // VALIDATION
  // =========================================================

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.jobForm.get(
        controlName
      );

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }
}