import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {
  ConfirmationService,
  MessageService
} from 'primeng/api';

import {
  Site
} from '../../models/site';

import {
  SiteService
} from '../../services/sites';

import {
  Customer
} from '../../../customers/models/customer';

import {
  CustomerService
} from '../../../customers/services/customer';


@Component({
  selector: 'app-site-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],

  providers: [
    MessageService,
    ConfirmationService
  ],

  templateUrl: './site-list.html',

  styleUrl: './site-list.css'
})
export class SiteList implements OnInit {

  private readonly siteService =
    inject(SiteService);

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);

  private readonly confirmationService =
    inject(ConfirmationService);


  /* =====================================================
     STATE
     ===================================================== */

  readonly sites =
    signal<Site[]>([]);

  readonly customers =
    signal<Customer[]>([]);

  readonly loading =
    signal(false);

  readonly customersLoading =
    signal(false);

  readonly error =
    signal(false);

  readonly searchTerm =
    signal('');

  readonly selectedCustomerId =
    signal<number | null>(null);


  /* =====================================================
     CUSTOMER FILTER OPTIONS
     ===================================================== */

  readonly customerOptions =
    computed(() => [

      {
        label: 'All Customers',
        value: null
      },

      ...this.customers().map(customer => ({
        label: customer.name,
        value: customer.id
      }))

    ]);


  /* =====================================================
     FILTERED SITES
     ===================================================== */

  readonly filteredSites =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const customerId =
        this.selectedCustomerId();


      return this.sites().filter(site => {

        const matchesSearch =
          !search ||
          site.name
            .toLowerCase()
            .includes(search) ||

          (site.address ?? '')
            .toLowerCase()
            .includes(search) ||

          (site.city ?? '')
            .toLowerCase()
            .includes(search) ||

          (site.state ?? '')
            .toLowerCase()
            .includes(search) ||

          (site.contactName ?? '')
            .toLowerCase()
            .includes(search) ||

          (site.contactPhone ?? '')
            .toLowerCase()
            .includes(search);


        const matchesCustomer =
          customerId === null ||
          site.customerId === customerId;


        return matchesSearch &&
               matchesCustomer;
      });
    });


  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  ngOnInit(): void {

    this.loadSites();

    this.loadCustomers();
  }


  /* =====================================================
     LOAD SITES
     ===================================================== */

  loadSites(): void {

    this.loading.set(true);

    this.error.set(false);


    this.siteService
      .getAllSites()
      .subscribe({

        next: sites => {

          this.sites.set(sites);

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load sites:',
            error
          );

          this.loading.set(false);

          this.error.set(true);

          this.showError(
            'Unable to load sites.'
          );
        }

      });
  }


  /* =====================================================
     LOAD CUSTOMERS
     ===================================================== */

  private loadCustomers(): void {

    this.customersLoading.set(true);


    this.customerService
      .getAllCustomers()
      .subscribe({

        next: customers => {

          this.customers.set(customers);

          this.customersLoading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load customers:',
            error
          );

          this.customersLoading.set(false);
        }

      });
  }


  /* =====================================================
     CUSTOMER NAME
     ===================================================== */

  getCustomerName(
    customerId: number
  ): string {

    return this.customers()
      .find(
        customer =>
          customer.id === customerId
      )
      ?.name ?? `Customer #${customerId}`;
  }


  /* =====================================================
     SEARCH
     ===================================================== */

  onSearch(
    value: string
  ): void {

    this.searchTerm.set(value);
  }


  /* =====================================================
     CUSTOMER FILTER
     ===================================================== */

  onCustomerChange(
    customerId: number | null
  ): void {

    this.selectedCustomerId.set(
      customerId
    );
  }


  /* =====================================================
     CREATE
     ===================================================== */

  createSite(): void {

    this.router.navigate([
      '/sites/create'
    ]);
  }


  /* =====================================================
     VIEW
     ===================================================== */

  viewSite(
    id: number
  ): void {

    this.router.navigate([
      '/sites',
      id
    ]);
  }


  /* =====================================================
     EDIT
     ===================================================== */

  editSite(
    id: number
  ): void {

    this.router.navigate([
      '/sites',
      id,
      'edit'
    ]);
  }


  /* =====================================================
     DELETE
     ===================================================== */

  deleteSite(
    site: Site
  ): void {

    this.confirmationService.confirm({

      header: 'Delete Site',

      message:
        `Are you sure you want to delete "${site.name}"? This action cannot be undone.`,

      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Delete Site',

      rejectLabel: 'Cancel',

      acceptButtonStyleClass:
        'p-button-danger',

      rejectButtonStyleClass:
        'p-button-secondary p-button-outlined',

      accept: () => {

        this.siteService
          .deleteSite(site.id)
          .subscribe({

            next: () => {

              this.sites.update(
                sites =>
                  sites.filter(
                    item =>
                      item.id !== site.id
                  )
              );

              this.messageService.add({
                severity: 'success',
                summary: 'Site Deleted',
                detail:
                  `${site.name} was deleted successfully.`
              });
            },

            error: error => {

              console.error(
                'Failed to delete site:',
                error
              );

              this.showError(
                this.getErrorMessage(
                  error,
                  'Unable to delete site.'
                )
              );
            }

          });
      }

    });
  }


  /* =====================================================
     ERROR MESSAGE
     ===================================================== */

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;
    }

    return fallback;
  }


  /* =====================================================
     ERROR TOAST
     ===================================================== */

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