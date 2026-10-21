import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';

import {
  InventoryService
} from '../../services/inventory';

import {
  Inventory
} from '../../models/inventory';

import {
  Part
} from '../../../parts/models/part';

import {
  PartService
} from '../../../parts/services/part';

@Component({
  selector: 'app-inventory-form',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    SelectModule,
    InputNumberModule,
    ButtonModule,
    ToastModule
  ],

  providers: [
    MessageService
  ],

  templateUrl: './inventory-form.html',
  styleUrl: './inventory-form.css'
})
export class InventoryForm implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly inventoryService =
    inject(InventoryService);

  private readonly partService =
    inject(PartService);

  private readonly messageService =
    inject(MessageService);

  // =========================================================
  // FORM
  // =========================================================

  inventoryForm!: FormGroup;

  // =========================================================
  // DATA
  // =========================================================

  readonly parts = signal<Part[]>([]);

  readonly inventory = signal<Inventory | null>(null);

  // =========================================================
  // STATE
  // =========================================================

  readonly editing = signal(false);

  readonly loading = signal(false);

  readonly saving = signal(false);

  inventoryId: number | null = null;

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {

    this.buildForm();

    this.loadParts();

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.editing.set(true);

      this.inventoryId =
        Number(id);

      this.loadInventory(
        this.inventoryId
      );

    }

  }

  // =========================================================
  // BUILD FORM
  // =========================================================

  private buildForm(): void {

    this.inventoryForm =
      this.fb.group({

        partId: [
          null,
          Validators.required
        ],

        quantity: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ],

        reorderLevel: [
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ]

      });

  }

  // =========================================================
  // LOAD PARTS
  // =========================================================

  private loadParts(): void {

    this.partService
      .getAllParts()
      .subscribe({

        next: (parts) => {

          this.parts.set(
            parts.filter(
              part => part.active
            )
          );

        },

        error: (error) => {

          console.error(
            'Failed to load parts',
            error
          );

          this.showError(
            'Unable to load parts'
          );

        }

      });

  }

  // =========================================================
  // LOAD INVENTORY
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

          this.inventoryForm.patchValue({

            partId:
              inventory.partId,

            quantity:
              inventory.quantity,

            reorderLevel:
              inventory.reorderLevel

          });

          // Existing inventory:
          // only reorder level can be changed.

          this.inventoryForm
            .get('partId')
            ?.disable();

          this.inventoryForm
            .get('quantity')
            ?.disable();

          this.loading.set(false);

        },

        error: (error) => {

          console.error(
            'Failed to load inventory',
            error
          );

          this.loading.set(false);

          this.showError(
            'Unable to load inventory'
          );

        }

      });

  }

  // =========================================================
  // SUBMIT
  // =========================================================

  onSubmit(): void {

    if (
      this.inventoryForm.invalid
    ) {

      this.inventoryForm.markAllAsTouched();

      return;
    }

    this.saving.set(true);

    if (this.editing()) {

      this.updateInventory();

    } else {

      this.createInventory();

    }

  }

  // =========================================================
  // CREATE
  // =========================================================

  private createInventory(): void {

    const formValue =
      this.inventoryForm.getRawValue();

    this.inventoryService
      .createInventory({

        partId:
          formValue.partId,

        quantity:
          formValue.quantity,

        reorderLevel:
          formValue.reorderLevel

      })
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Inventory Created',
            detail:
              'Inventory has been created successfully.'
          });

          setTimeout(() => {

            this.router.navigate([
              '/inventory'
            ]);

          }, 600);

        },

        error: (error) => {

          console.error(
            'Failed to create inventory',
            error
          );

          this.saving.set(false);

          this.showError(
            error?.error?.message ??
            'Unable to create inventory'
          );

        }

      });

  }

  // =========================================================
  // UPDATE
  // =========================================================

  private updateInventory(): void {

    if (!this.inventoryId) {
      return;
    }

    const reorderLevel =
      this.inventoryForm
        .get('reorderLevel')
        ?.value;

    this.inventoryService
      .updateInventory(
        this.inventoryId,
        {
          reorderLevel
        }
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Inventory Updated',
            detail:
              'Inventory has been updated successfully.'
          });

          setTimeout(() => {

            this.router.navigate([
              '/inventory',
              this.inventoryId
            ]);

          }, 600);

        },

        error: (error) => {

          console.error(
            'Failed to update inventory',
            error
          );

          this.saving.set(false);

          this.showError(
            error?.error?.message ??
            'Unable to update inventory'
          );

        }

      });

  }

  // =========================================================
  // CANCEL
  // =========================================================

  onCancel(): void {

    if (this.inventoryId) {

      this.router.navigate([
        '/inventory',
        this.inventoryId
      ]);

      return;
    }

    this.router.navigate([
      '/inventory'
    ]);

  }

  // =========================================================
  // VALIDATION
  // =========================================================

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.inventoryForm.get(
        controlName
      );

    return !!(
      control &&
      control.invalid &&
      control.touched
    );

  }

  // =========================================================
  // ERROR
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