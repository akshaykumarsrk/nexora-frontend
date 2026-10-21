import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  ConfirmationService,
  MessageService
} from 'primeng/api';

import {
  TableModule
} from 'primeng/table';

import {
  ButtonModule
} from 'primeng/button';

import {
  InputTextModule
} from 'primeng/inputtext';

import {
  SelectModule
} from 'primeng/select';

import {
  TagModule
} from 'primeng/tag';

import { FormsModule } from '@angular/forms';

import {
  ConfirmDialogModule
} from 'primeng/confirmdialog';

import {
  ToastModule
} from 'primeng/toast';

import {
  Asset
} from '../../models/asset';

import {
  AssetService
} from '../../services/asset';

import {
  Site
} from '../../../sites/models/site';

import {
  SiteService
} from '../../../sites/services/sites';

import {
  Customer
} from '../../../customers/models/customer';

import {
  CustomerService
} from '../../../customers/services/customer';


@Component({
  selector: 'app-asset-list',
  standalone: true,

  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    FormsModule
  ],

  providers: [
    ConfirmationService
  ],

  templateUrl: './asset-list.html',
  styleUrl: './asset-list.css'
})
export class AssetList implements OnInit {

  private readonly assetService =
    inject(AssetService);

  private readonly siteService =
    inject(SiteService);

  private readonly customerService =
    inject(CustomerService);

  private readonly router =
    inject(Router);

  private readonly confirmationService =
    inject(ConfirmationService);

  private readonly messageService =
    inject(MessageService);


  /* ======================================================
     STATE
     ====================================================== */

  readonly assets =
    signal<Asset[]>([]);

  readonly sites =
    signal<Site[]>([]);

  readonly customers =
    signal<Customer[]>([]);

  readonly loading =
    signal(false);

  readonly sitesLoading =
    signal(false);

  readonly customersLoading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly searchTerm =
    signal('');

  readonly selectedSiteId =
    signal<number | null>(null);


  /* ======================================================
     FILTER OPTIONS
     ====================================================== */

  readonly siteOptions =
    computed(() =>
      this.sites().map(site => ({
        label: site.name,
        value: site.id
      }))
    );


  /* ======================================================
     FILTERED ASSETS
     ====================================================== */

  readonly filteredAssets =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const siteId =
        this.selectedSiteId();

      return this.assets().filter(asset => {

        const matchesSearch =
          !search ||
          asset.assetCode
            .toLowerCase()
            .includes(search) ||
          asset.name
            .toLowerCase()
            .includes(search) ||
          (asset.category ?? '')
            .toLowerCase()
            .includes(search) ||
          (asset.brand ?? '')
            .toLowerCase()
            .includes(search) ||
          (asset.serialNumber ?? '')
            .toLowerCase()
            .includes(search);

        const matchesSite =
          siteId === null ||
          asset.siteId === siteId;

        return matchesSearch && matchesSite;
      });
    });


  /* ======================================================
     INIT
     ====================================================== */

  ngOnInit(): void {

    this.loadAssets();
    this.loadSites();
    this.loadCustomers();
  }


  /* ======================================================
     LOAD ASSETS
     ====================================================== */

  loadAssets(): void {

    this.loading.set(true);
    this.error.set(null);

    this.assetService
      .getAllAssets()
      .subscribe({

        next: assets => {

          this.assets.set(assets);

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load assets',
            error
          );

          this.error.set(
            'Unable to load assets. Please try again.'
          );

          this.loading.set(false);
        }
      });
  }


  /* ======================================================
     LOAD SITES
     ====================================================== */

  private loadSites(): void {

    this.sitesLoading.set(true);

    this.siteService
      .getAllSites()
      .subscribe({

        next: sites => {

          this.sites.set(sites);

          this.sitesLoading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load sites',
            error
          );

          this.sitesLoading.set(false);
        }
      });
  }


  /* ======================================================
     LOAD CUSTOMERS
     ====================================================== */

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
            'Failed to load customers',
            error
          );

          this.customersLoading.set(false);
        }
      });
  }


  /* ======================================================
     SEARCH
     ====================================================== */

  onSearch(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(
      input.value
    );
  }


  /* ======================================================
     SITE FILTER
     ====================================================== */

  onSiteChange(
    siteId: number | null
  ): void {

    this.selectedSiteId.set(
      siteId
    );
  }


  /* ======================================================
     LOOKUPS
     ====================================================== */

  getSiteName(
    siteId: number
  ): string {

    return this.sites()
      .find(site => site.id === siteId)
      ?.name ?? 'Unknown Site';
  }


  getCustomerNameBySite(
    siteId: number
  ): string {

    const site =
      this.sites()
        .find(site => site.id === siteId);

    if (!site) {
      return 'Unknown Customer';
    }

    return this.customers()
      .find(customer =>
        customer.id === site.customerId
      )
      ?.name ?? 'Unknown Customer';
  }


  /* ======================================================
     STATUS
     ====================================================== */

  getStatusSeverity(
    status: string
  ): 'success' | 'warn' | 'danger' | 'secondary' {

    switch (
      status.toLowerCase()
    ) {

      case 'active':
        return 'success';

      case 'inactive':
        return 'secondary';

      case 'retired':
        return 'danger';

      default:
        return 'warn';
    }
  }


  /* ======================================================
     WARRANTY
     ====================================================== */

  getWarrantyLabel(
    warrantyEndDate?: string | null
  ): string {

    if (!warrantyEndDate) {
      return 'Not specified';
    }

    const today =
      new Date();

    const warranty =
      new Date(warrantyEndDate);

    if (warranty < today) {
      return 'Expired';
    }

    return 'Valid';
  }


  getWarrantySeverity(
    warrantyEndDate?: string | null
  ): 'success' | 'danger' | 'secondary' {

    if (!warrantyEndDate) {
      return 'secondary';
    }

    const today =
      new Date();

    const warranty =
      new Date(warrantyEndDate);

    return warranty < today
      ? 'danger'
      : 'success';
  }


  /* ======================================================
     NAVIGATION
     ====================================================== */

  createAsset(): void {

    this.router.navigate([
      '/assets/create'
    ]);
  }


  viewAsset(
    id: number
  ): void {

    this.router.navigate([
      '/assets',
      id
    ]);
  }


  editAsset(
    id: number
  ): void {

    this.router.navigate([
      '/assets',
      id,
      'edit'
    ]);
  }


  /* ======================================================
     DELETE
     ====================================================== */

  deleteAsset(
    asset: Asset
  ): void {

    this.confirmationService.confirm({

      message:
        `Are you sure you want to delete "${asset.name}"?`,

      header: 'Delete Asset',

      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Delete',

      rejectLabel: 'Cancel',

      acceptButtonStyleClass:
        'p-button-danger',

      rejectButtonStyleClass:
        'p-button-secondary',

      accept: () => {

        this.assetService
          .deleteAsset(asset.id)
          .subscribe({

            next: () => {

              this.assets.update(
                assets =>
                  assets.filter(
                    item =>
                      item.id !== asset.id
                  )
              );

              this.messageService.add({

                severity: 'success',

                summary: 'Asset Deleted',

                detail:
                  `${asset.name} was deleted successfully.`
              });
            },

            error: error => {

              console.error(
                'Failed to delete asset',
                error
              );

              this.messageService.add({

                severity: 'error',

                summary: 'Delete Failed',

                detail:
                  'Unable to delete the asset.'
              });
            }
          });
      }
    });
  }
}