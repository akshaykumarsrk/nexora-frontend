import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  JobCard,
  JobCardRequest
} from '../../models/job-card';

import {
  JobCardService
} from '../../services/job-card';

import { JobService } from '../../../jobs/services/job';
import { Job } from '../../../jobs/models/job';


@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  selector: 'app-job-card-form',

  styleUrl: './job-card-form.css',

  templateUrl: './job-card-form.html',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCardForm implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly jobCardService =
    inject(JobCardService);

  private readonly jobService =
    inject(JobService);


  // =========================================================
  // STATE
  // =========================================================

  readonly loading =
    signal(false);

  readonly saving =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly jobId =
    signal<number | null>(null);

  readonly jobCardId =
    signal<number | null>(null);

  readonly editing =
    signal(false);

  readonly availableJobs = signal<Job[]>([]);
  readonly selectedJobId = signal<number | null>(null);


  // =========================================================
  // FORM
  // =========================================================

  readonly form =
    this.fb.nonNullable.group({

      problemReported: [
        '',
        Validators.required
      ],

      diagnosis: [
        ''
      ],

      workPerformed: [
        ''
      ],

      findings: [
        ''
      ],

      technicianRemarks: [
        ''
      ],

      customerRemarks: [
        ''
      ]

    });


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * EDIT MODE
     *
     * URL:
     * /job-cards/:id/edit
     *
     * Here "id" = JOB CARD ID
     */

    const jobCardIdParam =
      this.route.snapshot.paramMap.get('id');


    if (jobCardIdParam) {

      const parsedJobCardId =
        Number(jobCardIdParam);

      if (
        !Number.isInteger(parsedJobCardId) ||
        parsedJobCardId <= 0
      ) {

        this.errorMessage.set(
          'Invalid Job Card ID.'
        );

        return;
      }

      this.editing.set(true);

      this.jobCardId.set(
        parsedJobCardId
      );

      this.loadJobCard(
        parsedJobCardId
      );

      return;
    }


    /*
     * CREATE MODE
     *
     * URL:
     * /job-cards/new?jobId=123
     *
     * Here "jobId" = JOB ID
     */

    const jobIdParam =
      this.route.snapshot.queryParamMap.get('jobId');


    if (!jobIdParam) {
      this.loadAvailableJobs();
      return;
    }


    const parsedJobId =
      Number(jobIdParam);


    if (
      !Number.isInteger(parsedJobId) ||
      parsedJobId <= 0
    ) {

      this.errorMessage.set(
        'Invalid Job ID.'
      );

      return;
    }


    this.jobId.set(
      parsedJobId
    );

  }


  private loadAvailableJobs(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const loadCardsAndFilter = (jobs: Job[]): void => {
      this.jobCardService.getJobCards().subscribe({
        next: cards => {
          const existingJobIds = new Set((cards ?? []).map(card => card.jobId));
          const eligible = (jobs ?? []).filter(job =>
            !['COMPLETED', 'CANCELLED'].includes(String(job.status).toUpperCase())
            && !existingJobIds.has(job.id)
          );
          this.availableJobs.set(eligible);
          this.loading.set(false);
          if (!eligible.length) {
            this.errorMessage.set('No eligible jobs are available for a new job card. Jobs must be assigned and must not already have a job card.');
          }
        },
        error: () => {
          // Still show jobs; the backend remains authoritative about duplicates.
          this.availableJobs.set((jobs ?? []).filter(job =>
            !['COMPLETED', 'CANCELLED'].includes(String(job.status).toUpperCase())
          ));
          this.loading.set(false);
          if (!this.availableJobs().length) {
            this.errorMessage.set('No eligible jobs are available for a new job card.');
          }
        }
      });
    };

    this.jobService.getAllJobs().subscribe({
      next: jobs => loadCardsAndFilter(jobs ?? []),
      error: () => this.jobService.getMyJobs().subscribe({
        next: jobs => loadCardsAndFilter(jobs ?? []),
        error: error => {
          console.error('Failed to load jobs for job card creation', error);
          this.loading.set(false);
          this.errorMessage.set(error?.error?.message ?? 'Unable to load eligible jobs. Refresh and try again.');
        }
      })
    });
  }

  selectJob(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const id = Number(value);
    if (Number.isInteger(id) && id > 0) {
      this.selectedJobId.set(id);
      this.jobId.set(id);
      this.errorMessage.set(null);
    } else {
      this.selectedJobId.set(null);
      this.jobId.set(null);
    }
  }

  // =========================================================
  // LOAD JOB CARD FOR EDIT
  // =========================================================

  private loadJobCard(
    id: number
  ): void {

    this.loading.set(true);

    this.errorMessage.set(null);


    this.jobCardService
      .getJobCardById(id)
      .subscribe({

        next: (jobCard: JobCard) => {

          /*
           * Customer has already acknowledged
           * the job card.
           *
           * Do not allow editing.
           */

          if (jobCard.customerAcknowledged) {

            this.errorMessage.set(
              'This job card has already been acknowledged by the customer and cannot be edited.'
            );

            this.loading.set(false);

            return;
          }


          // Save related Job ID

          this.jobId.set(
            jobCard.jobId
          );


          // Fill existing data into form

          this.form.patchValue({

            problemReported:
              jobCard.problemReported ?? '',

            diagnosis:
              jobCard.diagnosis ?? '',

            workPerformed:
              jobCard.workPerformed ?? '',

            findings:
              jobCard.findings ?? '',

            technicianRemarks:
              jobCard.technicianRemarks ?? '',

            customerRemarks:
              jobCard.customerRemarks ?? ''

          });


          this.loading.set(false);

        },


        error: (error) => {

          console.error(
            'Failed to load job card',
            error
          );

          this.errorMessage.set(
            'Unable to load job card for editing.'
          );

          this.loading.set(false);

        }

      });

  }


  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    this.errorMessage.set(null);

    this.form.markAllAsTouched();


    if (this.form.invalid) {
      return;
    }


    const currentJobId =
      this.jobId() ?? this.selectedJobId();


    if (!currentJobId) {

      this.errorMessage.set(
        'Job ID is missing.'
      );

      return;
    }


    const request: JobCardRequest = {

      jobId: currentJobId,

      problemReported:
        this.form.controls.problemReported.value.trim(),

      diagnosis:
        this.form.controls.diagnosis.value.trim(),

      workPerformed:
        this.form.controls.workPerformed.value.trim(),

      findings:
        this.form.controls.findings.value.trim(),

      technicianRemarks:
        this.form.controls.technicianRemarks.value.trim(),

      customerRemarks:
        this.form.controls.customerRemarks.value.trim()

    };


    this.saving.set(true);


    /*
     * =====================================================
     * EDIT
     * =====================================================
     */

    if (this.editing()) {

      const currentJobCardId =
        this.jobCardId();


      if (!currentJobCardId) {

        this.saving.set(false);

        this.errorMessage.set(
          'Job Card ID is missing.'
        );

        return;
      }


      this.jobCardService
        .updateJobCard(
          currentJobCardId,
          request
        )
        .subscribe({

          next: () => {

            this.saving.set(false);


            /*
             * After editing:
             * go back to Job Card Details
             */

            this.router.navigate([
              '/job-cards',
              currentJobCardId
            ]);

          },


          error: (error) => {

            console.error(
              'Failed to update job card',
              error
            );

            this.saving.set(false);

            this.errorMessage.set(
              error?.error?.message ?? 'Failed to update job card. Please try again.'
            );

          }

        });

      return;
    }


    /*
     * =====================================================
     * CREATE
     * =====================================================
     */

    this.jobCardService
      .createJobCard(request)
      .subscribe({

        next: (createdJobCard: JobCard) => {
          this.saving.set(false);
          this.router.navigate([
            '/job-cards',
            createdJobCard.id
          ]);
        },


        error: (error) => {

          console.error(
            'Failed to create job card',
            error
          );

          this.saving.set(false);

          this.errorMessage.set(
            'Failed to create job card. Please try again.'
          );

        }

      });

  }


  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    const currentJobCardId =
      this.jobCardId();

    const currentJobId =
      this.jobId();


    /*
     * If editing,
     * return to Job Card Details.
     */

    if (
      this.editing() &&
      currentJobCardId
    ) {

      this.router.navigate([
        '/job-cards',
        currentJobCardId
      ]);

      return;
    }


    /*
     * If creating,
     * return to Job Details.
     */

    if (currentJobId) {

      this.router.navigate([
        '/jobs',
        currentJobId
      ]);

      return;
    }


    this.router.navigate([
      '/jobs'
    ]);

  }


  // =========================================================
  // HELPERS
  // =========================================================

  isInvalid(
    controlName: keyof typeof this.form.controls
  ): boolean {

    const control =
      this.form.controls[controlName];

    return control.invalid &&
      control.touched;

  }

}