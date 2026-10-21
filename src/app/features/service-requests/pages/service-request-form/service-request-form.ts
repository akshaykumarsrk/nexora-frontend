import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  ServiceRequestService
} from '../../services/service-request';

import {
  ServiceRequestRequest
} from '../../models/service-request';

import {
  CustomerService
} from '../../../customers/services/customer';

import {
  Customer
} from '../../../customers/models/customer';

import {
  SiteService
} from '../../../sites/services/sites';

import {
  Site
} from '../../../sites/models/site';

import {
  AssetService
} from '../../../assets/services/asset';

import {
  Asset
} from '../../../assets/models/asset';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  imports: [
    CommonModule,
    FormsModule,

    CardModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    ProgressSpinnerModule
  ],
  selector: 'app-service-request-form',
  styleUrl: './service-request-form.css',
  templateUrl: './service-request-form.html',
})
export class ServiceRequestForm implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly serviceRequestService =
    inject(ServiceRequestService);

  private readonly customerService =
    inject(CustomerService);

  private readonly siteService =
    inject(SiteService);

  private readonly assetService =
    inject(AssetService);


  // =========================================================
  // STATE
  // =========================================================

  readonly loading =
    signal(false);

  readonly saving =
    signal(false);

  readonly customers =
    signal<Customer[]>([]);

  readonly sites =
    signal<Site[]>([]);

  readonly assets =
    signal<Asset[]>([]);

  readonly loadingSites =
    signal(false);

  readonly loadingAssets =
    signal(false);


  // =========================================================
  // FORM STATE
  // =========================================================

  readonly customerId =
    signal<number | null>(null);

  readonly siteId =
    signal<number | null>(null);

  readonly assetId =
    signal<number | null>(null);

  readonly title =
    signal('');

  readonly description =
    signal('');

  readonly priority =
    signal<string | null>(null);


  // =========================================================
  // EDIT MODE
  // =========================================================

  readonly editingId =
    signal<number | null>(null);

  readonly isEditMode =
    signal(false);


  // =========================================================
  // PRIORITIES
  // =========================================================

  readonly priorities = [
    {
      label: 'Low',
      value: 'LOW'
    },
    {
      label: 'Medium',
      value: 'MEDIUM'
    },
    {
      label: 'High',
      value: 'HIGH'
    },
    {
      label: 'Urgent',
      value: 'URGENT'
    }
  ];


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCustomers();

    const idParam =
      this.route.snapshot.paramMap.get('id');

    if (idParam) {

      const id = Number(idParam);

      if (id) {

        this.editingId.set(id);

        this.isEditMode.set(true);

        this.loadServiceRequest(id);
      }
    }
  }


  // =========================================================
  // LOAD CUSTOMERS
  // =========================================================

  loadCustomers(): void {

    this.customerService
      .getAllCustomers()
      .subscribe({

        next: (customers) => {

          this.customers.set(
            customers ?? []
          );
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load customers',
            error
          );

          this.customers.set([]);
        }
      });
  }


  // =========================================================
  // LOAD SERVICE REQUEST
  // =========================================================

  loadServiceRequest(
    id: number
  ): void {

    this.loading.set(true);

    this.serviceRequestService
      .getServiceRequestById(id)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({

        next: (request) => {

          this.customerId.set(
            request.customerId
          );

          this.siteId.set(
            request.siteId
          );

          this.assetId.set(
            request.assetId
          );

          this.title.set(
            request.title
          );

          this.description.set(
            request.description ?? ''
          );

          this.priority.set(
            request.priority
          );

          /*
           * Load dependent dropdowns after
           * restoring the selected values.
           */

          this.loadSites(
            request.customerId,
            request.siteId,
            request.assetId
          );
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load service request',
            error
          );
        }
      });
  }


  // =========================================================
  // CUSTOMER CHANGE
  // =========================================================

  onCustomerChange(
    customerId: number | null
  ): void {

    this.customerId.set(customerId);

    this.siteId.set(null);

    this.assetId.set(null);

    this.sites.set([]);

    this.assets.set([]);

    if (!customerId) {
      return;
    }

    this.loadSites(customerId);
  }


  // =========================================================
  // LOAD SITES
  // =========================================================

  loadSites(
    customerId: number,
    selectedSiteId: number | null = null,
    selectedAssetId: number | null = null
  ): void {

    this.loadingSites.set(true);

    this.siteService
      .getSitesByCustomer(customerId)
      .pipe(
        finalize(() => {
          this.loadingSites.set(false);
        })
      )
      .subscribe({

        next: (sites) => {

          this.sites.set(
            sites ?? []
          );

          if (selectedSiteId) {

            this.siteId.set(
              selectedSiteId
            );

            this.loadAssets(
              selectedSiteId,
              selectedAssetId
            );
          }
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load sites',
            error
          );

          this.sites.set([]);
          this.assets.set([]);
        }
      });
  }


  // =========================================================
  // SITE CHANGE
  // =========================================================

  onSiteChange(
    siteId: number | null
  ): void {

    this.siteId.set(siteId);

    this.assetId.set(null);

    this.assets.set([]);

    if (!siteId) {
      return;
    }

    this.loadAssets(siteId);
  }


  // =========================================================
  // LOAD ASSETS
  // =========================================================

  loadAssets(
    siteId: number,
    selectedAssetId: number | null = null
  ): void {

    this.loadingAssets.set(true);

    this.assetService
      .getAssetsBySite(siteId)
      .pipe(
        finalize(() => {
          this.loadingAssets.set(false);
        })
      )
      .subscribe({

        next: (assets) => {

          this.assets.set(
            assets ?? []
          );

          if (selectedAssetId) {

            this.assetId.set(
              selectedAssetId
            );
          }
        },

        error: (error: unknown) => {

          console.error(
            'Failed to load assets',
            error
          );

          this.assets.set([]);
        }
      });
  }


  // =========================================================
  // SAVE
  // =========================================================

  save(): void {

    const customerId =
      this.customerId();

    const siteId =
      this.siteId();

    const title =
      this.title().trim();

    const priority =
      this.priority();

    if (!customerId) {
      return;
    }

    if (!siteId) {
      return;
    }

    if (!title) {
      return;
    }

    if (!priority) {
      return;
    }


    const request: ServiceRequestRequest = {

      customerId,

      siteId,

      assetId:
        this.assetId(),

      title,

      description:
        this.description().trim() || null,

      priority
    };


    this.saving.set(true);


    const id =
      this.editingId();


    const request$ =
      id
        ? this.serviceRequestService
            .updateServiceRequest(
              id,
              request
            )
        : this.serviceRequestService
            .createServiceRequest(
              request
            );


    request$
      .pipe(
        finalize(() => {
          this.saving.set(false);
        })
      )
      .subscribe({

        next: () => {

          this.router.navigate([
            '/service-requests'
          ]);
        },

        error: (error: unknown) => {

          console.error(
            'Failed to save service request',
            error
          );
        }
      });
  }


  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    this.router.navigate([
      '/service-requests'
    ]);
  }
}
