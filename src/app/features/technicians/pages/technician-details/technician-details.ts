import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Technician } from '../../models/technician';
import { TechnicianService } from '../../services/technician';

@Component({
  selector: 'app-technician-details',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './technician-details.html',
  styleUrl: './technician-details.css'
})
export class TechnicianDetails implements OnInit {

  private readonly technicianService =
    inject(TechnicianService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);

  readonly technician =
    signal<Technician | null>(null);

  readonly loading =
    signal(true);

  ngOnInit(): void {

    const id =
      Number(this.route.snapshot.paramMap.get('id'));

    if (
      !id ||
      !Number.isInteger(id) ||
      id <= 0
    ) {

      this.showError('Invalid technician ID.');
      this.goBack();

      return;
    }

    this.loadTechnician(id);
  }

  private loadTechnician(id: number): void {

    this.loading.set(true);

    this.technicianService
      .getTechnicianById(id)
      .subscribe({

        next: (technician) => {

          this.technician.set(technician);
          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load technician',
            error
          );

          this.loading.set(false);

          this.showError(
            'Unable to load technician.'
          );
        }

      });
  }

  editTechnician(): void {

    const technician =
      this.technician();

    if (!technician) {
      return;
    }

    this.router.navigate([
      '/technicians',
      technician.id,
      'edit'
    ]);
  }

  goBack(): void {

    this.router.navigate([
      '/technicians'
    ]);
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'secondary' | 'warn' | 'danger' {

    switch (status) {

      case 'ACTIVE':
        return 'success';

      case 'ON_LEAVE':
        return 'warn';

      case 'INACTIVE':
        return 'secondary';

      default:
        return 'danger';
    }
  }

  formatStatus(status: string): string {

    switch (status) {

      case 'ACTIVE':
        return 'Active';

      case 'INACTIVE':
        return 'Inactive';

      case 'ON_LEAVE':
        return 'On Leave';

      default:
        return status;
    }
  }

  formatDate(date: string | null): string {

    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleString(
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

  private showError(detail: string): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail
    });
  }
}