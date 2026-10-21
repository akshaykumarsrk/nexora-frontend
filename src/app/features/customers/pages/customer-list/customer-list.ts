import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {
  MessageService,
  ConfirmationService
} from 'primeng/api';

import { Customer } from '../../models/customer';
import { CustomerService } from '../../services/customer';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit {

  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly customers = signal<Customer[]>([]);

  readonly loading = signal(false);
  readonly error = signal(false);

  searchTerm = '';
  customerTypeFilter = 'ALL';

  customerTypeOptions = [
    {
      label: 'All Types',
      value: 'ALL'
    },
    {
      label: 'Individual',
      value: 'INDIVIDUAL'
    },
    {
      label: 'Business',
      value: 'BUSINESS'
    }
  ];


  ngOnInit(): void {
    this.loadCustomers();
  }


  loadCustomers(): void {

    this.loading.set(true);
    this.error.set(false);

    this.customerService.getAllCustomers().subscribe({

      next: (customers) => {

        this.customers.set(customers);

        this.loading.set(false);
      },

      error: (error) => {

        console.error('Failed to load customers:', error);

        this.loading.set(false);
        this.error.set(true);

        this.showError(
          'Unable to load customers. Please try again.'
        );
      }

    });
  }


  get filteredCustomers(): Customer[] {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.customers().filter(customer => {

      const matchesSearch =
        !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.gstNumber?.toLowerCase().includes(search);

      const matchesType =
        this.customerTypeFilter === 'ALL' ||
        customer.customerType === this.customerTypeFilter;

      return matchesSearch && matchesType;
    });
  }


  createCustomer(): void {

    this.router.navigate([
      '/customers',
      'create'
    ]);
  }


  viewCustomer(id: number): void {

    this.router.navigate([
      '/customers',
      id
    ]);
  }


  editCustomer(id: number): void {

    this.router.navigate([
      '/customers',
      id,
      'edit'
    ]);
  }


  deleteCustomer(customer: Customer): void {

    this.confirmationService.confirm({

      message:
        `Are you sure you want to delete "${customer.name}"?`,

      header: 'Delete Customer',

      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Delete',

      rejectLabel: 'Cancel',

      acceptButtonStyleClass: 'p-button-danger',

      accept: () => {

        this.customerService
          .deleteCustomer(customer.id)
          .subscribe({

            next: () => {

              this.customers.set(
                this.customers().filter(
                  item => item.id !== customer.id
                )
              );

              this.messageService.add({
                severity: 'success',
                summary: 'Customer Deleted',
                detail:
                  `${customer.name} was deleted successfully.`
              });
            },

            error: (error) => {

              console.error(
                'Failed to delete customer:',
                error
              );

              this.showError(
                'Unable to delete customer.'
              );
            }

          });
      }

    });
  }


  getCustomerTypeLabel(type: string): string {

    switch (type) {

      case 'BUSINESS':
        return 'Business';

      case 'INDIVIDUAL':
        return 'Individual';

      default:
        return type;
    }
  }


  getCustomerTypeSeverity(
    type: string
  ): 'success' | 'info' | 'warn' | 'secondary' {

    switch (type) {

      case 'BUSINESS':
        return 'info';

      case 'INDIVIDUAL':
        return 'success';

      default:
        return 'secondary';
    }
  }


  private showError(message: string): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }
}