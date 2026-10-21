import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

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

import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import {
  Inventory
} from '../../models/inventory';

import {
  InventoryService
} from '../../services/inventory';

@Component({
  selector: 'app-inventory-list',
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
    ConfirmDialogModule
  ],

  providers: [
    MessageService,
    ConfirmationService
  ],

  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css'
})
export class InventoryList implements OnInit {

  private readonly inventoryService =
    inject(InventoryService);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);

  private readonly confirmationService =
    inject(ConfirmationService);

  // =========================================================
  // DATA
  // =========================================================

  readonly inventory = signal<Inventory[]>([]);

  readonly loading = signal(false);

  error = false;

  // =========================================================
  // FILTERS
  // =========================================================

  searchTerm = '';

  stockFilter = 'ALL';

  stockOptions = [
    {
      label: 'All Stock',
      value: 'ALL'
    },
    {
      label: 'In Stock',
      value: 'IN_STOCK'
    },
    {
      label: 'Low Stock',
      value: 'LOW_STOCK'
    },
    {
      label: 'Out of Stock',
      value: 'OUT_OF_STOCK'
    }
  ];

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    this.loadInventory();
  }

  // =========================================================
  // LOAD
  // =========================================================

  loadInventory(): void {

    this.loading.set(true);
    this.error = false;

    this.inventoryService
      .getAllInventory()
      .subscribe({

        next: (response) => {

          this.inventory.set(response);

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load inventory',
            error
          );

          this.loading.set(false);
          this.error = true;

          this.showError(
            'Unable to load inventory'
          );
        }

      });
  }

  // =========================================================
  // FILTERED DATA
  // =========================================================

  get filteredInventory(): Inventory[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.inventory().filter(
      item => {

        const matchesSearch =
          !search ||
          item.partName
            .toLowerCase()
            .includes(search) ||
          item.partCode
            .toLowerCase()
            .includes(search);

        const matchesStock =
          this.stockFilter === 'ALL' ||
          (
            this.stockFilter === 'LOW_STOCK' &&
            item.lowStock &&
            item.availableQuantity > 0
          ) ||
          (
            this.stockFilter === 'OUT_OF_STOCK' &&
            item.availableQuantity === 0
          ) ||
          (
            this.stockFilter === 'IN_STOCK' &&
            !item.lowStock &&
            item.availableQuantity > 0
          );

        return matchesSearch && matchesStock;
      }
    );
  }

  // =========================================================
  // STOCK STATUS
  // =========================================================

  getStockLabel(item: Inventory): string {

    if (item.availableQuantity === 0) {
      return 'Out of Stock';
    }

    if (item.lowStock) {
      return 'Low Stock';
    }

    return 'In Stock';
  }

  getStockClass(item: Inventory): string {

    if (item.availableQuantity === 0) {
      return 'out-of-stock';
    }

    if (item.lowStock) {
      return 'low-stock';
    }

    return 'in-stock';
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  createInventory(): void {
    this.router.navigate([
      '/inventory/create'
    ]);
  }

  viewInventory(id: number): void {
    this.router.navigate([
      '/inventory',
      id
    ]);
  }

  editInventory(id: number): void {
    this.router.navigate([
      '/inventory',
      id,
      'edit'
    ]);
  }

  // =========================================================
  // DEACTIVATE
  // =========================================================

  deactivateInventory(
    item: Inventory
  ): void {

    this.confirmationService.confirm({

      header: 'Deactivate Inventory',

      message:
        `Are you sure you want to deactivate inventory for "${item.partName}"?`,

      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Deactivate',

      rejectLabel: 'Cancel',

      acceptButtonStyleClass:
        'p-button-danger',

      rejectButtonStyleClass:
        'p-button-secondary p-button-outlined',

      accept: () => {

        this.inventoryService
          .deactivateInventory(item.id)
          .subscribe({

            next: () => {

              this.messageService.add({
                severity: 'success',
                summary: 'Inventory Deactivated',
                detail:
                  `${item.partName} inventory has been deactivated.`
              });

              this.loadInventory();
            },

            error: (error) => {

              console.error(
                'Failed to deactivate inventory',
                error
              );

              this.showError(
                'Unable to deactivate inventory'
              );
            }

          });
      }

    });
  }

  // =========================================================
  // HELPERS
  // =========================================================

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