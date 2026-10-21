import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule,
  DatePipe,
  CurrencyPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { JobService } from '../../../features/jobs/services/job';
import { Job } from '../../../features/jobs/models/job';

import { JobPartService } from '../services/job-part';

import {
  JobPart,
  JobPartRequest
} from '../models/job-part';

import { JobCardList } from '../../job-cards/components/job-card-list/job-card-list';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-job-details',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    JobCardList,

    CardModule,
    TagModule,
    ButtonModule,
    DividerModule,
    ProgressSpinnerModule,

    DialogModule,
    SelectModule,
    InputNumberModule,
    TextareaModule,
    TableModule,

    DatePipe,
    CurrencyPipe
  ],

  templateUrl: './job-details.html',
  styleUrl: './job-details.css'
})
export class JobDetails implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly jobService = inject(JobService);

  private readonly jobPartService = inject(JobPartService);


  // =========================================================
  // JOB
  // =========================================================

  jobId: number | null = null;

  readonly job = signal<Job | null>(null);

  readonly loading = signal(false);

  actionLoading = false;


  // =========================================================
  // JOB PARTS
  // =========================================================

  readonly jobParts = signal<JobPart[]>([]);

  readonly jobPartsLoading = signal(false);

  showJobPartDialog = false;

  editingJobPart: JobPart | null = null;


  // =========================================================
  // JOB PART FORM
  // =========================================================

  jobPartForm = {
    partId: null as number | null,

    technicianId: null as number | null,

    quantity: 1,

    unitPrice: 0,

    notes: ''
  };


  // =========================================================
  // DROPDOWN DATA
  // =========================================================

  parts: any[] = [];

  technicians: any[] = [];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {

      this.router.navigate(['/jobs']);

      return;
    }

    this.jobId = id;

    this.loadJob(id);

    this.loadJobParts();
  }


  // =========================================================
  // LOAD JOB
  // =========================================================

  loadJob(id: number): void {

    this.loading.set(true);

    this.jobService
      .getJobById(id)
      .subscribe({

        next: (job: Job) => {

          this.job.set(job);

          this.loading.set(false);

          console.log('Loaded job:', job);
          console.log('LOADING AFTER API:', this.loading());
          console.log('JOB AFTER API:', this.job());
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load job',
            error
          );

          this.loading.set(false);
        }
      });
  }


  // =========================================================
  // LOAD JOB PARTS
  // =========================================================

  loadJobParts(): void {

    if (!this.jobId) {
      return;
    }

    this.jobPartsLoading.set(true);

    this.jobPartService
      .getJobPartsByJobId(this.jobId)
      .subscribe({

        next: (parts: JobPart[]) => {

        this.jobParts.set(parts ?? []);

        this.jobPartsLoading.set(false);
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load job parts',
            error
          );

          this.jobParts.set([]);

          this.jobPartsLoading.set(false);
        }
      });
  }


  // =========================================================
  // ADD JOB PART DIALOG
  // =========================================================

  openAddJobPartDialog(): void {

    this.editingJobPart = null;

    this.jobPartForm = {

      partId: null,

      technicianId: null,

      quantity: 1,

      unitPrice: 0,

      notes: ''
    };

    this.showJobPartDialog = true;
  }


  // =========================================================
  // EDIT JOB PART DIALOG
  // =========================================================

  openEditJobPartDialog(
    jobPart: JobPart
  ): void {

    this.editingJobPart = jobPart;

    this.jobPartForm = {

      partId:
        jobPart.partId ?? null,

      technicianId:
        jobPart.technicianId ?? null,

      quantity:
        jobPart.quantity ?? 1,

      unitPrice:
        jobPart.unitPrice ?? 0,

      notes:
        jobPart.notes ?? ''
    };

    this.showJobPartDialog = true;
  }


  // =========================================================
  // CLOSE JOB PART DIALOG
  // =========================================================

  closeJobPartDialog(): void {

    this.showJobPartDialog = false;

    this.editingJobPart = null;
  }


  // =========================================================
  // QUANTITY CHANGE
  // =========================================================

  onQuantityChange(): void {

    if (
      this.jobPartForm.quantity === null ||
      this.jobPartForm.quantity < 1
    ) {

      this.jobPartForm.quantity = 1;
    }
  }


  // =========================================================
  // UNIT PRICE CHANGE
  // =========================================================

  onUnitPriceChange(): void {

    if (
      this.jobPartForm.unitPrice === null ||
      this.jobPartForm.unitPrice < 0
    ) {

      this.jobPartForm.unitPrice = 0;
    }
  }


  // =========================================================
  // SAVE JOB PART
  // =========================================================

  saveJobPart(): void {

    if (!this.jobId) {

      return;
    }

    if (!this.jobPartForm.partId) {

      return;
    }

    /*
     * JobPartRequest requires technicianId to be a number,
     * not null.
     */
    if (!this.jobPartForm.technicianId) {

      return;
    }

    if (this.jobPartForm.quantity < 1) {

      this.jobPartForm.quantity = 1;
    }

    if (this.jobPartForm.unitPrice < 0) {

      this.jobPartForm.unitPrice = 0;
    }


    const request: JobPartRequest = {

      jobId: this.jobId,

      partId:
        this.jobPartForm.partId,

      technicianId:
        this.jobPartForm.technicianId,

      quantity:
        this.jobPartForm.quantity,

      unitPrice:
        this.jobPartForm.unitPrice,

      notes:
        this.jobPartForm.notes
    };


    this.actionLoading = true;


    // =======================================================
    // UPDATE
    // =======================================================

    if (this.editingJobPart?.id) {

      this.jobPartService
        .updateJobPart(
          this.editingJobPart.id,
          request
        )
        .subscribe({

          next: () => {

            this.actionLoading = false;

            this.closeJobPartDialog();

            this.loadJobParts();
          },

          error: (error: unknown) => {

            console.error(
              'Failed to update job part',
              error
            );

            this.actionLoading = false;
          }
        });

      return;
    }


    // =======================================================
    // CREATE
    // =======================================================

    /*
     * Use the create method exposed by JobPartService.
     *
     * Your current JobPartService does not have
     * addJobPart(), which is why the previous version failed.
     */
    this.jobPartService
      .createJobPart(request)
      .subscribe({

        next: () => {

          this.actionLoading = false;

          this.closeJobPartDialog();

          this.loadJobParts();
        },

        error: (error: unknown) => {

          console.error(
            'Failed to create job part',
            error
          );

          this.actionLoading = false;
        }
      });
  }


  // =========================================================
  // DELETE JOB PART
  // =========================================================

  deleteJobPart(
    jobPart: JobPart
  ): void {

    if (!jobPart.id) {

      return;
    }

    this.actionLoading = true;

    this.jobPartService
      .deleteJobPart(jobPart.id)
      .subscribe({

        next: () => {

          this.actionLoading = false;

          this.loadJobParts();
        },

        error: (error: unknown) => {

          console.error(
            'Failed to delete job part',
            error
          );

          this.actionLoading = false;
        }
      });
  }


  // =========================================================
  // EDIT JOB
  // =========================================================

  editJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.router.navigate([
      '/jobs',
      job.id,
      'edit'
    ]);
  }


  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {

    this.router.navigate(['/jobs']);
  }

  // =========================================================
  // ASSIGN TECHNICIAN
  // =========================================================

  assignTechnician(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.router.navigate([
      '/jobs',
      job.id,
      'assign'
    ]);
  }


  // =========================================================
  // SCHEDULE JOB
  // =========================================================

  scheduleJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.actionLoading = true;

    this.jobService
      .scheduleJob(job.id)
      .subscribe({

        next: (updatedJob: Job) => {

          this.job.set(updatedJob);

          this.actionLoading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Failed to schedule job',
            error
          );

          this.actionLoading = false;
        }

      });
  }


  // =========================================================
  // START JOB
  // =========================================================

  startJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.actionLoading = true;

    this.jobService
      .startJob(job.id)
      .subscribe({

        next: (updatedJob: Job) => {

          this.job.set(updatedJob);

          this.actionLoading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Failed to start job',
            error
          );

          this.actionLoading = false;
        }

      });
  }


  // =========================================================
  // HOLD JOB
  // =========================================================

  holdJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.actionLoading = true;

    this.jobService
      .holdJob(job.id)
      .subscribe({

        next: (updatedJob: Job) => {

          this.job.set(updatedJob);

          this.actionLoading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Failed to put job on hold',
            error
          );

          this.actionLoading = false;
        }

      });
  }


  // =========================================================
  // RESUME JOB
  // =========================================================

  resumeJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.actionLoading = true;

    this.jobService
      .resumeJob(job.id)
      .subscribe({

        next: (updatedJob: Job) => {

          this.job.set(updatedJob);

          this.actionLoading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Failed to resume job',
            error
          );

          this.actionLoading = false;
        }

      });
  }


  // =========================================================
  // COMPLETE JOB
  // =========================================================

  completeJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    /*
     * JobService.completeJob() requires
     * a workSummary.
     *
     * Your current JobDetails page does not
     * have a work-summary input yet.
     */
    const workSummary = job.workSummary ?? '';

    this.actionLoading = true;

    this.jobService
      .completeJob(
        job.id,
        workSummary
      )
      .subscribe({

        next: (updatedJob: Job) => {

          this.job.set(updatedJob);

          this.actionLoading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Failed to complete job',
            error
          );

          this.actionLoading = false;
        }

      });
  }


  // =========================================================
  // CANCEL JOB
  // =========================================================

  cancelJob(): void {

    const job = this.job();

    if (!job) {
      return;
    }

    this.actionLoading = true;

    this.jobService
      .cancelJob(job.id)
      .subscribe({

        next: (updatedJob: Job) => {

          this.job.set(updatedJob);

          this.actionLoading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Failed to cancel job',
            error
          );

          this.actionLoading = false;
        }

      });
  }


  // =========================================================
  // STATUS SEVERITY
  // =========================================================

  getSeverity(
    status?: string
  ):
    'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (status) {

      case 'COMPLETED':
        return 'success';

      case 'IN_PROGRESS':
        return 'info';

      case 'ASSIGNED':
      case 'SCHEDULED':
        return 'warn';

      case 'ON_HOLD':
        return 'secondary';

      case 'CANCELLED':
        return 'danger';

      default:
        return 'contrast';
    }
  }


  // =========================================================
  // PERMISSIONS
  // =========================================================

  canEdit(): boolean {

    const job = this.job();

    if (!job) {
      return false;
    }

    return ![
      'COMPLETED',
      'CANCELLED',
      'IN_PROGRESS'
    ].includes(job.status);
  }


  canAssign(): boolean {

    return this.job()?.status === 'CREATED';
  }


  canSchedule(): boolean {

    return this.job()?.status === 'ASSIGNED';
  }


  canStart(): boolean {

    return this.job()?.status === 'SCHEDULED';
  }


  canHold(): boolean {

    return this.job()?.status === 'IN_PROGRESS';
  }


  canResume(): boolean {

    return this.job()?.status === 'ON_HOLD';
  }


  canComplete(): boolean {

    return this.job()?.status === 'IN_PROGRESS';
  }


  canCancel(): boolean {

    const job = this.job();

    if (!job) {
      return false;
    }

    return ![
      'COMPLETED',
      'CANCELLED'
    ].includes(job.status);
  }
}