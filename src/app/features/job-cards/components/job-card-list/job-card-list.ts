import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  JobCard
} from '../../models/job-card';

import {
  JobCardService
} from '../../services/job-card';

@Component({
  imports: [
    CommonModule
  ],
  selector: 'app-job-card-list',
  styleUrl: './job-card-list.css',
  templateUrl: './job-card-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCardList implements OnInit {

  @Input()
  jobId?: number;

  @Input()
  embedded = false;

  private readonly jobCardService =
    inject(JobCardService);

  private readonly router =
    inject(Router);


  // =========================================================
  // STATE
  // =========================================================

  readonly jobCards =
    signal<JobCard[]>([]);

  readonly loading =
    signal(true);


  // =========================================================
  // LOAD JOB CARDS
  // =========================================================

  ngOnInit(): void {
    
    this.loadJobCards();

  }

  loadJobCards(): void {

    this.loading.set(true);

    this.jobCardService
      .getJobCards()
      .subscribe({

        next: (jobCards) => {

          const visibleCards = this.jobId == null
            ? (jobCards ?? [])
            : (jobCards ?? []).filter(card => card.jobId === this.jobId);

          this.jobCards.set(visibleCards);

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load job cards',
            error
          );

          this.jobCards.set([]);

          this.loading.set(false);

        }

      });

  }


  // =========================================================
  // CREATE
  // =========================================================

  createJobCard(): void {

    if (this.jobId != null) {
      this.router.navigate(['/job-cards/new'], {
        queryParams: { jobId: this.jobId }
      });
      return;
    }

    // Global list: the form will let the user choose an eligible job.
    this.router.navigate(['/job-cards/new']);
  }


  // =========================================================
  // VIEW
  // =========================================================

  viewJobCard(
    jobCard: JobCard
  ): void {

    this.router.navigate([
      '/job-cards',
      jobCard.id
    ]);

  }


  // =========================================================
  // EDIT
  // =========================================================

  editJobCard(
    jobCard: JobCard
  ): void {

    if (jobCard.customerAcknowledged) {
      return;
    }

    this.router.navigate([
      '/job-cards',
      jobCard.id,
      'edit'
    ]);

  }


  // =========================================================
  // ACKNOWLEDGE
  // =========================================================

  acknowledgeJobCard(
    jobCard: JobCard
  ): void {

    if (jobCard.customerAcknowledged) {
      return;
    }

    this.jobCardService
      .acknowledgeJobCard(jobCard.id)
      .subscribe({

        next: (updatedJobCard) => {

          this.jobCards.update(
            cards =>
              cards.map(card =>
                card.id === updatedJobCard.id
                  ? updatedJobCard
                  : card
              )
          );

        },

        error: (error) => {

          console.error(
            'Failed to acknowledge job card',
            error
          );

        }

      });

  }


  // =========================================================
  // STATUS
  // =========================================================

  getAcknowledgementClass(
    acknowledged: boolean
  ): string {

    return acknowledged
      ? 'acknowledged'
      : 'pending';

  }


  getAcknowledgementLabel(
    acknowledged: boolean
  ): string {

    return acknowledged
      ? 'ACKNOWLEDGED'
      : 'PENDING';

  }


  // =========================================================
  // TEXT PREVIEW
  // =========================================================

  getPreview(
    value: string | null,
    maxLength = 85
  ): string {

    if (!value) {
      return '—';
    }

    if (value.length <= maxLength) {
      return value;
    }

    return `${value.substring(0, maxLength)}...`;

  }

}
