import {
  ChangeDetectionStrategy,
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

import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { PartService } from '../../services/part';

import { Part } from '../../models/part';


@Component({
  selector: 'app-part-details',

  standalone: true,

  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule
  ],

  templateUrl: './part-details.html',

  styleUrl: './part-details.css',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartDetails implements OnInit {

  private readonly partService =
    inject(PartService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly messageService =
    inject(MessageService);


  readonly part =
    signal<Part | null>(null);

  readonly loading =
    signal(true);


  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (
      !id ||
      !Number.isInteger(id) ||
      id <= 0
    ) {

      this.showError(
        'Invalid part ID.'
      );

      this.loading.set(false);

      return;
    }

    this.loadPart(id);
  }


  /* =========================================================
     LOAD PART
     ========================================================= */

  private loadPart(id: number): void {

    this.loading.set(true);

    this.partService
      .getPartById(id)
      .subscribe({

        next: (part) => {

          this.part.set(part);

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load part:',
            error
          );

          this.loading.set(false);

          this.showError(
            error?.error?.message ||
            'Unable to load part.'
          );
        }

      });
  }


  /* =========================================================
     EDIT
     ========================================================= */

  editPart(): void {

    const currentPart =
      this.part();

    if (!currentPart) {
      return;
    }

    this.router.navigate([
      '/parts',
      currentPart.id,
      'edit'
    ]);
  }


  /* =========================================================
     BACK
     ========================================================= */

  goBack(): void {

    this.router.navigate([
      '/parts'
    ]);
  }


  /* =========================================================
     STATUS
     ========================================================= */

  getStatusLabel(
    active: boolean
  ): string {

    return active
      ? 'Active'
      : 'Inactive';
  }


  getStatusSeverity(
    active: boolean
  ): 'success' | 'danger' {

    return active
      ? 'success'
      : 'danger';
  }


  /* =========================================================
     DATE
     ========================================================= */

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date);
  }


  /* =========================================================
     ERROR
     ========================================================= */

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