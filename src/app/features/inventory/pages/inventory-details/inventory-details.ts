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

import {
  Inventory
} from '../../models/inventory';

import {
  InventoryService
} from '../../services/inventory';

@Component({
  selector: 'app-inventory-details',
  standalone: true,

  imports: [
    CommonModule,
    ButtonModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './inventory-details.html',
  styleUrl: './inventory-details.css'
})
export class InventoryDetails implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly inventoryService =
    inject(InventoryService);

  private readonly messageService =
    inject(MessageService);

  // =========================================================
  // DATA
  // =========================================================

  readonly inventory = signal<Inventory | null>(null);

  readonly loading = signal(true);

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.router.navigate([
        '/inventory'
      ]);

      return;
    }

    this.loadInventory(
      Number(id)
    );

  }

  // =========================================================
  // LOAD
  // =========================================================

  private loadInventory(
    id: number
  ): void {

    this.loading.set(true);

    this.inventoryService
      .getInventoryById(id)
      .subscribe({

        next: (inventory) => {

          this.inventory.set(inventory);

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load inventory',
            error
          );

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ??
              'Inventory not found'
          });

        }

      });

  }

  // =========================================================
  // STATUS
  // =========================================================

  getStockLabel(): string {

    if (!this.inventory) {
      return '';
    }

    if (
      this.inventory()?.availableQuantity === 0
    ) {

      return 'Out of Stock';

    }

    if (this.inventory()?.lowStock) {

      return 'Low Stock';

    }

    return 'In Stock';
  }

  getStockClass(): string {

    if (!this.inventory) {
      return '';
    }

    if (
      this.inventory()?.availableQuantity === 0
    ) {

      return 'out-of-stock';

    }

    if (this.inventory()?.lowStock) {

      return 'low-stock';

    }

    return 'in-stock';
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  goBack(): void {

    this.router.navigate([
      '/inventory'
    ]);

  }

  editInventory(): void {

    if (!this.inventory) {
      return;
    }

    this.router.navigate([
      '/inventory',
      this.inventory()?.id,
      'edit'
    ]);

  }

  viewPart(): void {

    if (!this.inventory) {
      return;
    }

    this.router.navigate([
      '/parts',
      this.inventory()?.partId
    ]);

  }

  // =========================================================
  // STOCK MOVEMENTS
  // =========================================================

  adjustStock(): void {

    const id = this.inventory()?.id;

    if (!id) {
      return;
    }

    this.router.navigate(
      ['/stock-movements'],
      {
        queryParams: {
          inventoryId: id,
          action: 'new'
        }
      }
    );

  }

  viewStockMovements(): void {

    const id = this.inventory()?.id;

    if (!id) {
      return;
    }

    this.router.navigate(
      ['/stock-movements'],
      {
        queryParams: {
          inventoryId: id
        }
      }
    );

  }

}