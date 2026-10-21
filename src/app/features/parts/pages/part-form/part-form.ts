import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

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

import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

import { PartService } from '../../services/part';

import {
  Part,
  PartRequest
} from '../../models/part';


@Component({
  selector: 'app-part-form',

  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ToastModule
  ],

  templateUrl: './part-form.html',

  styleUrl: './part-form.css'
})
export class PartForm implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly partService = inject(PartService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly messageService = inject(MessageService);


  /* =========================================================
     STATE
     ========================================================= */

  readonly loading = signal(false);

  isSubmitting = false;

  isEditMode = false;

  partId: number | null = null;

  part: Part | null = null;


  /* =========================================================
     FORM
     ========================================================= */

  partForm!: FormGroup;


  /* =========================================================
     LIFECYCLE
     ========================================================= */

  ngOnInit(): void {

    this.initializeForm();

    this.detectEditMode();

    if (this.isEditMode && this.partId) {

      this.loadPart(this.partId);
    }
  }


  /* =========================================================
     FORM INITIALIZATION
     ========================================================= */

  private initializeForm(): void {

    this.partForm = this.fb.group({

      partCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      category: [
        '',
        [
          Validators.maxLength(100)
        ]
      ],

      brand: [
        '',
        [
          Validators.maxLength(100)
        ]
      ],

      unit: [
        '',
        [
          Validators.maxLength(50)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ]
    });
  }


  /* =========================================================
     EDIT MODE
     ========================================================= */

  private detectEditMode(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.isEditMode = false;

      this.partId = null;

      return;
    }

    const parsedId = Number(id);

    if (
      !Number.isInteger(parsedId) ||
      parsedId <= 0
    ) {

      this.isEditMode = false;

      this.partId = null;

      this.showError(
        'Invalid part ID.'
      );

      return;
    }

    this.isEditMode = true;

    this.partId = parsedId;
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

          this.part = part;

          this.partForm.patchValue({

            partCode: part.partCode,

            name: part.name,

            category: part.category ?? '',

            brand: part.brand ?? '',

            unit: part.unit ?? '',

            description: part.description ?? ''
          });

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load part',
            error
          );

          this.loading.set(false);

          this.showError(
            'Unable to load part.'
          );
        }
      });
  }


  /* =========================================================
     SUBMIT
     ========================================================= */

  submit(): void {

    if (this.partForm.invalid) {

      this.partForm.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fix the highlighted fields.'
      });

      return;
    }


    const value =
      this.partForm.getRawValue();


    const request: PartRequest = {

      partCode:
        value.partCode.trim(),

      name:
        value.name.trim(),

      category:
        value.category?.trim() || null,

      brand:
        value.brand?.trim() || null,

      unit:
        value.unit?.trim() || null,

      description:
        value.description?.trim() || null
    };


    this.isSubmitting = true;


    if (
      this.isEditMode &&
      this.partId
    ) {

      this.updatePart(
        this.partId,
        request
      );

    } else {

      this.createPart(request);
    }
  }


  /* =========================================================
     CREATE
     ========================================================= */

  private createPart(
    request: PartRequest
  ): void {

    this.partService
      .createPart(request)
      .subscribe({

        next: (part) => {

          this.isSubmitting = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Part Created',
            detail:
              `${part.name} was created successfully.`
          });

          setTimeout(() => {

            this.router.navigate([
              '/parts',
              part.id
            ]);

          }, 500);
        },

        error: (error) => {

          this.isSubmitting = false;

          console.error(
            'Failed to create part',
            error
          );

          this.handleError(
            error,
            'Unable to create part.'
          );
        }
      });
  }


  /* =========================================================
     UPDATE
     ========================================================= */

  private updatePart(
    id: number,
    request: PartRequest
  ): void {

    this.partService
      .updatePart(id, request)
      .subscribe({

        next: (part) => {

          this.isSubmitting = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Part Updated',
            detail:
              `${part.name} was updated successfully.`
          });

          setTimeout(() => {

            this.router.navigate([
              '/parts',
              part.id
            ]);

          }, 500);
        },

        error: (error) => {

          this.isSubmitting = false;

          console.error(
            'Failed to update part',
            error
          );

          this.handleError(
            error,
            'Unable to update part.'
          );
        }
      });
  }


  /* =========================================================
     BACK
     ========================================================= */

  cancel(): void {

    if (
      this.isEditMode &&
      this.partId
    ) {

      this.router.navigate([
        '/parts',
        this.partId
      ]);

      return;
    }

    this.router.navigate([
      '/parts'
    ]);
  }

  /* =========================================================
     SHOW ERROR
     ========================================================= */

  private showError(message: string): void {

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }


  /* =========================================================
     SERVER ERROR HANDLING
     ========================================================= */

  private handleError(
    error: any,
    fallbackMessage: string
  ): void {

    const message =
      error?.error?.message ||
      fallbackMessage;

    /*
     * Backend currently returns:
     *
     * "Part code already exists"
     *
     * as a general API error.
     */

    if (
      message
        .toLowerCase()
        .includes('part code already exists')
    ) {

      const control =
        this.partForm.get('partCode');

      control?.setErrors({
        ...(control.errors ?? {}),
        server: message
      });

      control?.markAsTouched();

      return;
    }


    this.messageService.add({
      severity: 'error',
      summary: 'Operation Failed',
      detail: message
    });
  }


  /* =========================================================
     ERROR MESSAGE HELPERS
     ========================================================= */

  getError(
    controlName: string
  ): string | null {

    const control =
      this.partForm.get(controlName);

    if (!control?.touched) {
      return null;
    }

    if (
      control.errors?.['server']
    ) {

      return control.errors['server'];
    }

    if (
      control.errors?.['required']
    ) {

      return 'This field is required.';
    }

    if (
      control.errors?.['maxlength']
    ) {

      return 'Maximum length exceeded.';
    }

    return null;
  }
}