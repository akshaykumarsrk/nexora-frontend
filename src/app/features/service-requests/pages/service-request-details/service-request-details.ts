import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  DatePipe
} from '@angular/common';

import {
  ServiceRequestService
} from '../../services/service-request';

import {
  ServiceRequest
} from '../../models/service-request';
import { finalize } from 'rxjs';
import { AiAssistantService, AiResponse } from '../../../ai-assistant/ai-assistant.service';
import { AuthService } from '../../../../core/services/auth';

@Component({
  imports: [
    DatePipe
  ],
  selector: 'app-service-request-details',
  styleUrl: './service-request-details.css',
  templateUrl: './service-request-details.html',
})
export class ServiceRequestDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly serviceRequestService =
    inject(ServiceRequestService);

  private readonly aiAssistant = inject(AiAssistantService);
  private readonly auth = inject(AuthService);

  canSummarizeWithAi(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'MANAGER' || role === 'STAFF';
  }

  readonly aiSummaryLoading = signal(false);
  readonly aiSummaryError = signal<string | null>(null);
  readonly aiSummary = signal<AiResponse | null>(null);


  // =========================================================
  // STATE
  // =========================================================

  serviceRequest = signal<ServiceRequest | null>(null);

  loading = signal(true);

  error = signal<string | null>(null);


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (!id) {

      this.error.set(
        'Invalid service request ID.'
      );

      this.loading.set(false);

      return;
    }

    this.loadServiceRequest(id);
  }


  // =========================================================
  // LOAD
  // =========================================================

  private loadServiceRequest(
    id: number
  ): void {

    this.loading.set(true);

    this.error.set(null);

    this.serviceRequestService
      .getServiceRequestById(id)
      .subscribe({

        next: (request) => {

          this.serviceRequest.set(request);

          this.loading.set(false);

        },

        error: (err) => {

          console.error(
            'Failed to load service request',
            err
          );

          this.error.set(
            'Unable to load service request.'
          );

          this.loading.set(false);

        }

      });
  }


  // =========================================================
  // NAVIGATION
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/service-requests'
    ]);
  }


  editServiceRequest(): void {

    const request =
      this.serviceRequest();

    if (!request) {
      return;
    }

    this.router.navigate([
      '/service-requests',
      request.id,
      'edit'
    ]);
  }

  summarizeWithAi(): void {
    const request = this.serviceRequest();
    if (!request || this.aiSummaryLoading()) return;
    this.aiSummaryLoading.set(true);
    this.aiSummaryError.set(null);
    this.aiSummary.set(null);
    this.aiAssistant.summarizeServiceRequest(request.id)
      .pipe(finalize(() => this.aiSummaryLoading.set(false)))
      .subscribe({
        next: result => this.aiSummary.set(result),
        error: error => this.aiSummaryError.set(error?.error?.message || 'Could not summarize this service request. Confirm that AI is enabled and your account has permission.')
      });
  }


  // =========================================================
  // HELPERS
  // =========================================================

  getPriorityClass(
    priority: string
  ): string {

    switch (priority) {

      case 'HIGH':
        return 'priority-high';

      case 'MEDIUM':
        return 'priority-medium';

      case 'LOW':
        return 'priority-low';

      default:
        return '';

    }
  }


  getStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'OPEN':
        return 'status-open';

      case 'PENDING':
        return 'status-pending';

      case 'IN_PROGRESS':
        return 'status-in-progress';

      case 'RESOLVED':
        return 'status-resolved';

      case 'COMPLETED':
        return 'status-completed';

      case 'CANCELLED':
      case 'CANCELED':
        return 'status-cancelled';

      default:
        return '';

    }
  }

}
