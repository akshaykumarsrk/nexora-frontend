import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { PartService } from '../../services/part';
import { AuthService } from '../../../../core/services/auth';
import { Part } from '../../models/part';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-part-list',

  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    FormsModule
  ],

  templateUrl: './part-list.html',

  styleUrl: './part-list.css',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartList implements OnInit {

  private readonly partService = inject(PartService);

  private readonly auth = inject(AuthService);

  canManageParts(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'MANAGER';
  }

  private readonly router = inject(Router);

  private readonly messageService = inject(MessageService);


  /* =========================================================
     STATE
     ========================================================= */

  readonly parts = signal<Part[]>([]);

  readonly loading = signal(true);

  readonly error = signal(false);


  /* =========================================================
     FILTERS
     ========================================================= */

  searchTerm = '';

  selectedCategory: string | null = null;

  selectedStatus: boolean | null = null;


  /* =========================================================
     FILTER OPTIONS
     ========================================================= */

  categories: { label: string; value: string }[] = [];

  readonly statusOptions = [
    {
      label: 'All Statuses',
      value: null
    },
    {
      label: 'Active',
      value: true
    },
    {
      label: 'Inactive',
      value: false
    }
  ];


  /* =========================================================
     LIFECYCLE
     ========================================================= */

  ngOnInit(): void {
    this.loadParts();
  }


  /* =========================================================
     LOAD
     ========================================================= */

  loadParts(): void {

    this.loading.set(true);

    this.error.set(false);

    this.partService.getAllParts().subscribe({

      next: (parts) => {

        const result = parts ?? [];

        this.parts.set(result);

        this.buildCategoryOptions(result);

        this.loading.set(false);
      },

      error: (error) => {

        console.error(
          'Failed to load parts',
          error
        );

        this.parts.set([]);

        this.error.set(true);

        this.loading.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Unable to load parts',
          detail: 'Something went wrong while loading parts.'
        });
      }
    });
  }


  /* =========================================================
     CATEGORY OPTIONS
     ========================================================= */

  private buildCategoryOptions(parts: Part[]): void {

    const categories = [
      ...new Set(
        parts
          .map(part => part.category)
          .filter(
            (category): category is string =>
              !!category?.trim()
          )
      )
    ];

    this.categories = categories
      .sort()
      .map(category => ({
        label: category,
        value: category
      }));
  }


  /* =========================================================
     FILTERED PARTS
     ========================================================= */

  get filteredParts(): Part[] {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.parts().filter(part => {

      const matchesSearch =
        !search ||
        part.partCode.toLowerCase().includes(search) ||
        part.name.toLowerCase().includes(search) ||
        (part.category ?? '')
          .toLowerCase()
          .includes(search) ||
        (part.brand ?? '')
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        !this.selectedCategory ||
        part.category === this.selectedCategory;

      const matchesStatus =
        this.selectedStatus === null ||
        this.selectedStatus === undefined ||
        part.active === this.selectedStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }


  /* =========================================================
     SEARCH
     ========================================================= */

  onSearch(value: string): void {
    this.searchTerm = value;
  }


  /* =========================================================
     CREATE
     ========================================================= */

  createPart(): void {

    this.router.navigate([
      '/parts',
      'create'
    ]);
  }


  /* =========================================================
     VIEW
     ========================================================= */

  viewPart(part: Part): void {

    this.router.navigate([
      '/parts',
      part.id
    ]);
  }


  /* =========================================================
     EDIT
     ========================================================= */

  editPart(part: Part): void {

    this.router.navigate([
      '/parts',
      part.id,
      'edit'
    ]);
  }


  /* =========================================================
     STATUS
     ========================================================= */

  getStatusSeverity(
    active: boolean
  ): 'success' | 'danger' {

    return active
      ? 'success'
      : 'danger';
  }


  getStatusLabel(
    active: boolean
  ): string {

    return active
      ? 'Active'
      : 'Inactive';
  }


  /* =========================================================
     CLEAR FILTERS
     ========================================================= */

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedCategory = null;

    this.selectedStatus = null;
  }
}