import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { JobCard } from '../../models/job-card';
import { JobCardService } from '../../services/job-card';

@Component({
  selector: 'app-job-card-details',

  imports: [
    CommonModule
  ],

  templateUrl: './job-card-details.html',
  styleUrl: './job-card-details.css',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobCardDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly jobCardService =
    inject(JobCardService);


  // =========================================================
  // STATE
  // =========================================================

  readonly jobCard =
    signal<JobCard | null>(null);

  readonly loading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  readonly acknowledging =
    signal(false);


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id =
      Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('Invalid job card ID.');
      this.loading.set(false);
      return;
    }

    this.loadJobCard(id);
  }


  // =========================================================
  // LOAD
  // =========================================================

  loadJobCard(id: number): void {

    this.loading.set(true);
    this.error.set(null);

    this.jobCardService
      .getJobCardById(id)
      .subscribe({

        next: (jobCard) => {

          this.jobCard.set(jobCard);
          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load job card',
            error
          );

          this.jobCard.set(null);

          this.error.set(
            'Unable to load job card details.'
          );

          this.loading.set(false);

        }

      });
  }


  // =========================================================
  // BACK
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/jobs',
      this.jobCard()?.jobId
    ]);

  }


  // =========================================================
  // EDIT
  // =========================================================

  editJobCard(): void {

    const card = this.jobCard();

    if (!card || card.customerAcknowledged) {
      return;
    }

    this.router.navigate([
      '/job-cards',
      card.id,
      'edit'
    ]);

  }


  // =========================================================
  // ACKNOWLEDGE
  // =========================================================

  acknowledgeJobCard(): void {

    const card = this.jobCard();

    if (
      !card ||
      card.customerAcknowledged ||
      this.acknowledging()
    ) {
      return;
    }

    this.acknowledging.set(true);

    this.jobCardService
      .acknowledgeJobCard(card.id)
      .subscribe({

        next: (updatedJobCard) => {

          this.jobCard.set(updatedJobCard);

          this.acknowledging.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to acknowledge job card',
            error
          );

          this.acknowledging.set(false);

        }

      });

  }


  // =========================================================
  // STATUS
  // =========================================================

  getAcknowledgementClass(): string {

    const card = this.jobCard();

    return card?.customerAcknowledged
      ? 'acknowledged'
      : 'pending';

  }


  getAcknowledgementLabel(): string {

    const card = this.jobCard();

    return card?.customerAcknowledged
      ? 'ACKNOWLEDGED'
      : 'PENDING';

  }


  // =========================================================
  // DATE
  // =========================================================

  formatDate(
    value: string | null
  ): string {

    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }


  // =========================================================
  // VALUE
  // =========================================================

  getValue(
    value: string | null
  ): string {

    return value?.trim()
      ? value
      : '—';

  }

}