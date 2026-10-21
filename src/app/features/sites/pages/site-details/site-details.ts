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
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import { Site } from '../../models/site';

import { SiteService } from '../../services/sites';

import { Customer } from '../../../customers/models/customer';

import { CustomerService } from '../../../customers/services/customer';


@Component({
  selector: 'app-site-details',

  standalone: true,

  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './site-details.html',

  styleUrl: './site-details.css'
})
export class SiteDetails implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly siteService =
    inject(SiteService);

  private readonly customerService =
    inject(CustomerService);

  private readonly messageService =
    inject(MessageService);


  /* =====================================================
     STATE
     ===================================================== */

  readonly site =
    signal<Site | null>(null);

  readonly customer =
    signal<Customer | null>(null);

  readonly loading =
    signal(true);

  readonly error =
    signal(false);


  readonly siteId =
    signal<number | null>(null);


  /* =====================================================
     INIT
     ===================================================== */

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');


    if (!id) {

      this.router.navigate([
        '/sites'
      ]);

      return;
    }


    const siteId =
      Number(id);


    if (Number.isNaN(siteId)) {

      this.router.navigate([
        '/sites'
      ]);

      return;
    }


    this.siteId.set(siteId);

    this.loadSite(siteId);
  }


  /* =====================================================
     LOAD SITE
     ===================================================== */

  private loadSite(
    id: number
  ): void {

    this.loading.set(true);

    this.error.set(false);


    this.siteService
      .getSiteById(id)
      .subscribe({

        next: site => {

          this.site.set(site);

          this.loading.set(false);

          this.loadCustomer(
            site.customerId
          );
        },


        error: error => {

          console.error(
            'Failed to load site:',
            error
          );

          this.loading.set(false);

          this.error.set(true);
        }

      });
  }


  /* =====================================================
     LOAD CUSTOMER
     ===================================================== */

  private loadCustomer(
    customerId: number
  ): void {

    this.customerService
      .getCustomerById(customerId)
      .subscribe({

        next: customer => {

          this.customer.set(
            customer
          );
        },


        error: error => {

          console.error(
            'Failed to load customer:',
            error
          );

        }

      });
  }


  /* =====================================================
     CUSTOMER NAME
     ===================================================== */

  customerName(): string {

    return (
      this.customer()?.name ??
      'Unknown Customer'
    );
  }


  /* =====================================================
     EDIT
     ===================================================== */

  onEdit(): void {

    const id =
      this.siteId();


    if (id === null) {
      return;
    }


    this.router.navigate([
      '/sites',
      id,
      'edit'
    ]);
  }


  /* =====================================================
     BACK
     ===================================================== */

  onBack(): void {

    this.router.navigate([
      '/sites'
    ]);
  }


  /* =====================================================
     RETRY
     ===================================================== */

  onRetry(): void {

    const id =
      this.siteId();


    if (id !== null) {

      this.loadSite(id);
    }
  }


  /* =====================================================
     FORMAT DATE
     ===================================================== */

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {

      return '—';
    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(
      new Date(value)
    );
  }

}