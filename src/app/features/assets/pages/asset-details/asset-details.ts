import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { Asset } from '../../models/asset';
import { AssetService } from '../../services/asset';
import { Site } from '../../../sites/models/site';
import { SiteService } from '../../../sites/services/sites';
import { Customer } from '../../../customers/models/customer';
import { CustomerService } from '../../../customers/services/customer';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './asset-details.html',
  styleUrl: './asset-details.css'
})
export class AssetDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assetService = inject(AssetService);
  private readonly siteService = inject(SiteService);
  private readonly customerService = inject(CustomerService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly asset = signal<Asset | null>(null);
  readonly site = signal<Site | null>(null);
  readonly customer = signal<Customer | null>(null);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private assetId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('Invalid asset ID.');
      this.loading.set(false);
      return;
    }

    this.assetId = id;
    this.loadAsset();
  }

  loadAsset(): void {
    this.loading.set(true);
    this.error.set(null);

    this.assetService.getAssetById(this.assetId).subscribe({
      next: (asset) => {
        this.asset.set(asset);
        this.loading.set(false);

        this.loadSite(asset.siteId);
      },
      error: (error) => {
        console.error('Failed to load asset:', error);

        this.error.set(
          error?.error?.message ?? 'Unable to load asset details.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadSite(siteId: number): void {
    this.siteService.getSiteById(siteId).subscribe({
      next: (site) => {
        this.site.set(site);

        this.loadCustomer(site.customerId);
      },
      error: (error) => {
        console.error('Failed to load site:', error);
      }
    });
  }

  private loadCustomer(customerId: number): void {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer) => {
        this.customer.set(customer);
      },
      error: (error) => {
        console.error('Failed to load customer:', error);
      }
    });
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';

      case 'inactive':
        return 'secondary';

      case 'under maintenance':
        return 'warn';

      case 'retired':
        return 'danger';

      default:
        return 'info';
    }
  }

  getWarrantyLabel(): string {
    const warrantyDate = this.asset()?.warrantyEndDate;

    if (!warrantyDate) {
      return 'Not specified';
    }

    const warranty = new Date(warrantyDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    warranty.setHours(0, 0, 0, 0);

    if (warranty < today) {
      return 'Expired';
    }

    return 'Valid';
  }

  getWarrantySeverity():
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    const warrantyDate = this.asset()?.warrantyEndDate;

    if (!warrantyDate) {
      return 'secondary';
    }

    const warranty = new Date(warrantyDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    warranty.setHours(0, 0, 0, 0);

    return warranty < today ? 'danger' : 'success';
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: string | null | undefined): string {
    if (!date) {
      return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editAsset(): void {
    this.router.navigate(['/assets', this.assetId, 'edit']);
  }

  deleteAsset(): void {
    const currentAsset = this.asset();

    if (!currentAsset) {
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${currentAsset.name}"?`,
      header: 'Delete Asset',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.assetService.deleteAsset(currentAsset.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Asset Deleted',
              detail: 'Asset has been deleted successfully.'
            });

            setTimeout(() => {
              this.router.navigate(['/assets']);
            }, 500);
          },
          error: (error) => {
            console.error('Failed to delete asset:', error);

            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail:
                error?.error?.message ??
                'Unable to delete the asset.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/assets']);
  }
}