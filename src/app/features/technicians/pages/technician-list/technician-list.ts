import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { TechnicianService } from '../../services/technician';
import { Technician } from '../../models/technician';

@Component({
  selector: 'app-technician-list',
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    CardModule,
    TableModule,
    TagModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './technician-list.html',
  styleUrl: './technician-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicianList implements OnInit {

  private readonly technicianService = inject(TechnicianService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly technicians = signal<Technician[]>([]);
  readonly loading = signal(true);

  searchTerm = '';
  selectedStatus: string | null = null;

  readonly statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'On Leave', value: 'ON_LEAVE' }
  ];

  ngOnInit(): void {
    this.loadTechnicians();
  }

  loadTechnicians(): void {
    this.loading.set(true);

    this.technicianService.getAllTechnicians().subscribe({
      next: (technicians) => {
        this.technicians.set(technicians ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load technicians', error);

        this.technicians.set([]);
        this.loading.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to load technicians.'
        });
      }
    });
  }

  get filteredTechnicians(): Technician[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.technicians().filter((technician) => {

      const matchesSearch =
        !search ||
        technician.name.toLowerCase().includes(search) ||
        technician.phone.toLowerCase().includes(search) ||
        technician.employeeCode?.toLowerCase().includes(search) ||
        technician.specialization?.toLowerCase().includes(search);

      const matchesStatus =
        !this.selectedStatus ||
        technician.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  createTechnician(): void {
    this.router.navigate(['/technicians/new']);
  }

  viewTechnician(technician: Technician): void {
    this.router.navigate([
      '/technicians',
      technician.id
    ]);
  }

  editTechnician(technician: Technician): void {
    this.router.navigate([
      '/technicians',
      technician.id,
      'edit'
    ]);
  }

  deleteTechnician(technician: Technician): void {

    this.technicianService
      .deleteTechnician(technician.id)
      .subscribe({
        next: () => {

          this.technicians.update((technicians) =>
            technicians.filter(
              (item) => item.id !== technician.id
            )
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `${technician.name} was deleted successfully.`
          });
        },

        error: (error) => {
          console.error(
            'Failed to delete technician',
            error
          );

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to delete technician.'
          });
        }
      });
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
}