import {
  Component,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  ConfirmationService,
  MessageService
} from 'primeng/api';

import { JobService } from '../services/job';
import {
  Job,
  JobStatus
} from '../models/job';

@Component({
  selector: 'app-job-list',

  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule
  ],

  providers: [
    ConfirmationService,
    MessageService
  ],

  templateUrl: './job-list.html',
  styleUrl: './job-list.css'
})
export class JobList implements OnInit {

  private readonly jobService = inject(JobService);

  private readonly router = inject(Router);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly messageService =
    inject(MessageService);

  @ViewChild('jobsTable')
  jobsTable!: Table;

  // =========================================================
  // DATA
  // =========================================================

  readonly jobs = signal<Job[]>([]);

  readonly loading = signal(false);

  selectedStatus: JobStatus | null = null;

  // =========================================================
  // STATUS OPTIONS
  // =========================================================

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Created', value: 'CREATED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'On Hold', value: 'ON_HOLD' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadJobs();
  }

  // =========================================================
  // LOAD JOBS
  // =========================================================

  loadJobs(): void {

    console.log('Loading jobs...');

    this.loading.set(true);

    this.jobService.getAllJobs().subscribe({

      next: (response: Job[]) => {

        console.log('JOBS API RESPONSE:', response);

        this.jobs.set(response ?? []);

        console.log(
          'JOBS COUNT:',
          this.jobs().length
        );

        this.loading.set(false);

        console.log(
          'LOADING:',
          this.loading
        );
      },

      error: (error) => {

        console.error(
          'JOBS API ERROR:',
          error
        );

        this.jobs.set([]);

        this.loading.set(false);

        this.showError(
          error?.error?.message ||
          'Failed to load jobs'
        );
      }

    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.jobsTable.filterGlobal(
      input.value,
      'contains'
    );
  }

  // =========================================================
  // STATUS FILTER
  // =========================================================

  filterByStatus(): void {

    if (!this.jobsTable) {
      return;
    }

    if (this.selectedStatus) {

      this.jobsTable.filter(
        this.selectedStatus,
        'status',
        'equals'
      );

    } else {

      this.jobsTable.filter(
        null,
        'status',
        'contains'
      );

      // this.jobsTable.clear();
    }
  }

  // =========================================================
  // CREATE
  // =========================================================

  createJob(): void {

    this.router.navigate([
      '/jobs/create'
    ]);
  }

  // =========================================================
  // VIEW
  // =========================================================

  viewJob(job: Job): void {

    this.router.navigate([
      '/jobs',
      job.id
    ]);
  }

  // =========================================================
  // EDIT
  // =========================================================

  editJob(job: Job): void {

    this.router.navigate([
      '/jobs',
      job.id,
      'edit'
    ]);
  }

  // =========================================================
  // ASSIGN
  // =========================================================

  assignTechnician(job: Job): void {

    this.router.navigate([
      '/jobs',
      job.id,
      'assign'
    ]);
  }

  // =========================================================
  // SCHEDULE
  // =========================================================

  scheduleJob(job: Job): void {

    this.jobService
      .scheduleJob(job.id)
      .subscribe({

        next: () => {

          this.showSuccess(
            'Job scheduled successfully'
          );

          this.loadJobs();
        },

        error: (error) => {

          this.showError(
            error?.error?.message ||
            'Unable to schedule job'
          );
        }

      });
  }

  // =========================================================
  // START
  // =========================================================

  startJob(job: Job): void {

    this.jobService
      .startJob(job.id)
      .subscribe({

        next: () => {

          this.showSuccess(
            'Job started successfully'
          );

          this.loadJobs();
        },

        error: (error) => {

          this.showError(
            error?.error?.message ||
            'Unable to start job'
          );
        }

      });
  }

  // =========================================================
  // HOLD
  // =========================================================

  holdJob(job: Job): void {

    this.jobService
      .holdJob(job.id)
      .subscribe({

        next: () => {

          this.showSuccess(
            'Job placed on hold'
          );

          this.loadJobs();
        },

        error: (error) => {

          this.showError(
            error?.error?.message ||
            'Unable to hold job'
          );
        }

      });
  }

  // =========================================================
  // RESUME
  // =========================================================

  resumeJob(job: Job): void {

    this.jobService
      .resumeJob(job.id)
      .subscribe({

        next: () => {

          this.showSuccess(
            'Job resumed successfully'
          );

          this.loadJobs();
        },

        error: (error) => {

          this.showError(
            error?.error?.message ||
            'Unable to resume job'
          );
        }

      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancelJob(job: Job): void {

    this.confirmationService.confirm({

      message:
        `Are you sure you want to cancel ${job.jobNumber}?`,

      header: 'Cancel Job',

      icon: 'pi pi-exclamation-triangle',

      accept: () => {

        this.jobService
          .cancelJob(job.id)
          .subscribe({

            next: () => {

              this.showSuccess(
                'Job cancelled successfully'
              );

              this.loadJobs();
            },

            error: (error) => {

              this.showError(
                error?.error?.message ||
                'Unable to cancel job'
              );
            }

          });

      }

    });
  }

  // =========================================================
  // DELETE
  // =========================================================

  deleteJob(job: Job): void {

    this.confirmationService.confirm({

      message:
        `Are you sure you want to delete ${job.jobNumber}?`,

      header: 'Delete Job',

      icon: 'pi pi-trash',

      acceptButtonStyleClass:
        'p-button-danger',

      accept: () => {

        this.jobService
          .deleteJob(job.id)
          .subscribe({

            next: () => {

              this.showSuccess(
                'Job deleted successfully'
              );

              this.loadJobs();
            },

            error: (error) => {

              this.showError(
                error?.error?.message ||
                'Unable to delete job'
              );
            }

          });

      }

    });
  }

  // =========================================================
  // STATUS SEVERITY
  // =========================================================

  getStatusSeverity(
    status: JobStatus
  ):
    'success' |
    'info' |
    'warn' |
    'danger' |
    'secondary' {

    switch (status) {

      case 'COMPLETED':
        return 'success';

      case 'IN_PROGRESS':
        return 'info';

      case 'ASSIGNED':
      case 'SCHEDULED':
        return 'info';

      case 'ON_HOLD':
        return 'warn';

      case 'CANCELLED':
        return 'danger';

      case 'CREATED':
      default:
        return 'secondary';
    }
  }

  // =========================================================
  // STATUS LABEL
  // =========================================================

  getStatusLabel(
    status: JobStatus
  ): string {

    if (!status) {
      return '-';
    }

    return status
      .replaceAll('_', ' ')
      .replace(
        /\w\S*/g,
        (word: string) =>
          word.charAt(0).toUpperCase() +
          word.substring(1).toLowerCase()
      );
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

}