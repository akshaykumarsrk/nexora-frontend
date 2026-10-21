import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  ServiceRequestService
} from '../../services/service-request';

import {
  ServiceRequest
} from '../../models/service-request';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  imports: [
    DatePipe,

    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule
  ],
  selector: 'app-service-request-list',
  styleUrl: './service-request-list.css',
  templateUrl: './service-request-list.html',
})
export class ServiceRequestList implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly router = inject(Router);

  private readonly serviceRequestService =
    inject(ServiceRequestService);


  // =========================================================
  // STATE
  // =========================================================

  readonly serviceRequests =
    signal<ServiceRequest[]>([]);

  readonly loading =
    signal(false);


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadServiceRequests();
  }


  // =========================================================
  // LOAD SERVICE REQUESTS
  // =========================================================

  loadServiceRequests(): void {

    this.loading.set(true);

    this.serviceRequestService
      .getAllServiceRequests()
      .subscribe({

        next: (requests) => {

          this.serviceRequests.set(
            requests ?? []
          );

          this.loading.set(false);
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load service requests',
            error
          );

          this.serviceRequests.set([]);

          this.loading.set(false);
        }
      });
  }


  // =========================================================
  // CREATE
  // =========================================================

  createServiceRequest(): void {

    this.router.navigate([
      '/service-requests',
      'new'
    ]);
  }


  // =========================================================
  // EDIT
  // =========================================================

  editServiceRequest(
    serviceRequest: ServiceRequest
  ): void {

    this.router.navigate([
      '/service-requests',
      serviceRequest.id,
      'edit'
    ]);
  }


  // =========================================================
  // DETAILS
  // =========================================================

  viewServiceRequest(
    serviceRequest: ServiceRequest
  ): void {

    this.router.navigate([
      '/service-requests',
      serviceRequest.id
    ]);
  }


  // =========================================================
  // PRIORITY SEVERITY
  // =========================================================

  getPrioritySeverity(
    priority?: string
  ):
    'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (priority?.toUpperCase()) {

      case 'LOW':
        return 'success';

      case 'MEDIUM':
        return 'info';

      case 'HIGH':
        return 'warn';

      case 'URGENT':
      case 'CRITICAL':
        return 'danger';

      default:
        return 'secondary';
    }
  }


  // =========================================================
  // STATUS SEVERITY
  // =========================================================

  getStatusSeverity(
    status?: string
  ):
    'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (status?.toUpperCase()) {

      case 'OPEN':
        return 'info';

      case 'ASSIGNED':
        return 'warn';

      case 'IN_PROGRESS':
        return 'warn';

      case 'COMPLETED':
        return 'success';

      case 'CANCELLED':
        return 'danger';

      case 'ON_HOLD':
        return 'secondary';

      default:
        return 'contrast';
    }
  }
}
