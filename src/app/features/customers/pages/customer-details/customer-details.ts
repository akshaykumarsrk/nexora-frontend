import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import { Customer } from '../../models/customer';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.css'
})
export class CustomerDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  private readonly messageService = inject(MessageService);

  readonly customer = signal<Customer | null>(null);

  readonly loading = signal(false);
  readonly error = signal(false);

  customerId: number | null = null;


  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate(['/customers']);

      return;
    }

    this.customerId = Number(id);

    this.loadCustomer(this.customerId);
  }


  private loadCustomer(id: number): void {

    this.loading.set(true);
    this.error.set(false);

    this.customerService
      .getCustomerById(id)
      .subscribe({

        next: (customer) => {

          this.customer.set(customer);

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load customer:',
            error
          );

          this.loading.set(false);
          this.error.set(true);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to load customer.'
          });
        }

      });
  }


  editCustomer(): void {

    if (!this.customerId) {
      return;
    }

    this.router.navigate([
      '/customers',
      this.customerId,
      'edit'
    ]);
  }


  goBack(): void {

    this.router.navigate([
      '/customers'
    ]);
  }


  getCustomerTypeLabel(
    type: string
  ): string {

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
  ): 'success' | 'info' | 'secondary' {

    switch (type) {

      case 'BUSINESS':
        return 'info';

      case 'INDIVIDUAL':
        return 'success';

      default:
        return 'secondary';
    }
  }


  retry(): void {

    if (this.customerId) {
      this.loadCustomer(this.customerId);
    }
  }
}