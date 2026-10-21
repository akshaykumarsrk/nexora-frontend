import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import {
  MovementType,
  StockMovement,
  StockMovementRequest
} from '../../models/stock-movement';

import { StockMovementService } from '../../services/stock-movement';
import { InventoryService } from '../../services/inventory';

import { Inventory } from '../../models/inventory';


@Component({
  selector: 'app-stock-movements',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './stock-movements.html',
  styleUrl: './stock-movements.css'
})
export class StockMovements implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  private readonly stockMovementService =
    inject(StockMovementService);

  private readonly inventoryService =
    inject(InventoryService);

  private readonly messageService =
    inject(MessageService);


  /* =========================================
     STATE
  ========================================= */

  readonly movements =
    signal<StockMovement[]>([]);

  readonly inventories =
    signal<Inventory[]>([]);

  readonly loading =
    signal(true);

  readonly inventoriesLoading =
    signal(false);

  readonly saving =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly searchTerm =
    signal('');

  readonly selectedMovementType =
    signal<MovementType | null>(null);

  readonly selectedInventoryId =
    signal<number | null>(null);

  readonly movementDialogVisible =
    signal(false);


  /* =========================================
     FILTER OPTIONS
  ========================================= */

  readonly movementTypeOptions = [

    {
      label: 'All Types',
      value: null
    },

    {
      label: 'Stock In',
      value: 'STOCK_IN' as MovementType
    },

    {
      label: 'Stock Out',
      value: 'STOCK_OUT' as MovementType
    },

    {
      label: 'Adjustment',
      value: 'ADJUSTMENT' as MovementType
    }

  ];


  readonly movementFormTypeOptions = [

    {
      label: 'Stock In',
      value: 'STOCK_IN' as MovementType
    },

    {
      label: 'Stock Out',
      value: 'STOCK_OUT' as MovementType
    },

    {
      label: 'Adjustment',
      value: 'ADJUSTMENT' as MovementType
    }

  ];


  readonly inventoryOptions =
    computed(() =>
      this.inventories().map(inventory => ({
        label:
          `${inventory.partCode} — ${inventory.partName}`,
        value: inventory.id
      }))
    );


  /* =========================================
     FILTERED DATA
  ========================================= */

  readonly filteredMovements =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const type =
        this.selectedMovementType();

      const inventoryId =
        this.selectedInventoryId();

      return this.movements().filter(
        movement => {

          const matchesSearch =
            !search ||
            movement.partCode
              .toLowerCase()
              .includes(search) ||
            movement.partName
              .toLowerCase()
              .includes(search) ||
            movement.movementType
              .toLowerCase()
              .includes(search) ||
            movement.reason
              ?.toLowerCase()
              .includes(search);

          const matchesType =
            !type ||
            movement.movementType === type;

          const matchesInventory =
            !inventoryId ||
            movement.inventoryId === inventoryId;

          return (
            matchesSearch &&
            matchesType &&
            matchesInventory
          );

        }
      );

    });


  /* =========================================
     FORM
  ========================================= */

  readonly movementForm =
    this.fb.nonNullable.group({

      inventoryId: [
        null as number | null,
        Validators.required
      ],

      movementType: [
        'STOCK_IN' as MovementType,
        Validators.required
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      reason: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]

    });


  /* =========================================
     LIFECYCLE
  ========================================= */

  ngOnInit(): void {

    this.loadMovements();

    this.loadInventories();

    this.handleQueryParams();

  }


  /* =========================================
     QUERY PARAMS
  ========================================= */

  private handleQueryParams(): void {

    const params =
      this.route.snapshot.queryParamMap;

    const inventoryIdParam =
      params.get('inventoryId');

    const action =
      params.get('action');

    if (!inventoryIdParam) {
      return;
    }

    const inventoryId =
      Number(inventoryIdParam);

    if (!Number.isFinite(inventoryId)) {
      return;
    }

    /*
     * Keep the inventory selected in the
     * Stock Movements filter.
     */
    this.selectedInventoryId.set(
      inventoryId
    );

    /*
     * If we came from Inventory Details
     * through "Adjust Stock", open the
     * movement dialog automatically.
     */
    if (action === 'new') {

      this.openMovementDialog(
        inventoryId
      );

    }

  }


  /* =========================================
     LOAD DATA
  ========================================= */

  loadMovements(): void {

    this.loading.set(true);

    this.error.set(null);

    this.stockMovementService
      .getAllMovements()
      .subscribe({

        next: movements => {

          this.movements.set(
            movements
          );

          this.loading.set(false);

        },

        error: error => {

          console.error(
            'Failed to load stock movements:',
            error
          );

          this.error.set(
            error?.error?.message ??
            'Unable to load stock movements.'
          );

          this.loading.set(false);

        }

      });

  }


  private loadInventories(): void {

    this.inventoriesLoading.set(true);

    this.inventoryService
      .getAllInventory()
      .subscribe({

        next: inventories => {

          this.inventories.set(
            inventories
          );

          this.inventoriesLoading.set(false);

        },

        error: error => {

          console.error(
            'Failed to load inventory:',
            error
          );

          this.inventoriesLoading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Inventory Error',
            detail:
              'Unable to load inventory options.'
          });

        }

      });

  }


  /* =========================================
     FILTER HANDLERS
  ========================================= */

  onSearch(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm.set(
      input.value
    );

  }


  onMovementTypeChange(
    value: MovementType | null
  ): void {

    this.selectedMovementType.set(
      value
    );

  }


  onInventoryChange(
    value: number | null
  ): void {

    this.selectedInventoryId.set(
      value
    );

  }


  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedMovementType.set(
      null
    );

    this.selectedInventoryId.set(
      null
    );

  }


  /* =========================================
     MOVEMENT DIALOG
  ========================================= */

  openMovementDialog(
    inventoryId: number | null = null
  ): void {

    this.movementForm.reset({

      inventoryId:
        inventoryId,

      movementType:
        'STOCK_IN',

      quantity:
        1,

      reason:
        ''

    });

    this.movementDialogVisible.set(
      true
    );

  }


  closeMovementDialog(): void {

    if (this.saving()) {
      return;
    }

    this.movementDialogVisible.set(
      false
    );

  }


  /* =========================================
     CREATE MOVEMENT
  ========================================= */

  saveMovement(): void {

    if (this.movementForm.invalid) {

      this.movementForm.markAllAsTouched();

      return;
    }

    const formValue =
      this.movementForm.getRawValue();

    if (!formValue.inventoryId) {
      return;
    }

    const request:
      StockMovementRequest = {

      inventoryId:
        formValue.inventoryId,

      movementType:
        formValue.movementType,

      quantity:
        formValue.quantity,

      reason:
        formValue.reason?.trim() ||
        null

    };


    this.saving.set(true);


    this.stockMovementService
      .createMovement(request)
      .subscribe({

        next: movement => {

          this.saving.set(false);

          this.movementDialogVisible.set(
            false
          );


          this.movements.update(
            current => [
              movement,
              ...current
            ]
          );


          this.messageService.add({

            severity: 'success',

            summary: 'Movement Created',

            detail:
              'Stock movement has been recorded successfully.'

          });


          /*
           * Refresh inventory because
           * quantities may have changed.
           */
          this.loadInventories();

        },


        error: error => {

          console.error(
            'Failed to create stock movement:',
            error
          );

          this.saving.set(false);

          this.messageService.add({

            severity: 'error',

            summary: 'Movement Failed',

            detail:
              error?.error?.message ??
              'Unable to create stock movement.'

          });

        }

      });

  }


  /* =========================================
     HELPERS
  ========================================= */

  getMovementLabel(
    type: MovementType
  ): string {

    switch (type) {

      case 'STOCK_IN':
        return 'Stock In';

      case 'STOCK_OUT':
        return 'Stock Out';

      case 'ADJUSTMENT':
        return 'Adjustment';

      default:
        return type;

    }

  }


  getMovementSeverity(
    type: MovementType
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {

    switch (type) {

      case 'STOCK_IN':
        return 'success';

      case 'STOCK_OUT':
        return 'danger';

      case 'ADJUSTMENT':
        return 'warn';

      default:
        return 'info';

    }

  }


  getQuantityPrefix(
    movement: StockMovement
  ): string {

    if (
      movement.movementType ===
      'STOCK_OUT'
    ) {

      return '-';

    }

    if (
      movement.movementType ===
      'STOCK_IN'
    ) {

      return '+';

    }

    return '';

  }


  getQuantityClass(
    movement: StockMovement
  ): string {

    switch (
      movement.movementType
    ) {

      case 'STOCK_IN':
        return 'quantity-in';

      case 'STOCK_OUT':
        return 'quantity-out';

      default:
        return 'quantity-adjustment';

    }

  }


  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '—';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  formatDateTime(
    date: string | null | undefined
  ): string {

    if (!date) {
      return '—';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return '—';

    }

    return parsedDate.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }


  goToInventory(): void {

    this.router.navigate([
      '/inventory'
    ]);

  }

}