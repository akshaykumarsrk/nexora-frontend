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

import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

import {
  Technician,
  TechnicianRequest
} from '../../models/technician';

import { TechnicianService } from '../../services/technician';

@Component({
  selector: 'app-technician-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ToastModule
  ],
  templateUrl: './technician-form.html',
  styleUrl: './technician-form.css'
})
export class TechnicianForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly technicianService = inject(TechnicianService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  technicianForm!: FormGroup;

  isEditMode = false;
  technicianId: number | null = null;

  technician: Technician | null = null;

  readonly loading = signal(false);

  submitting = false;

  readonly statusOptions = [
    {
      label: 'Active',
      value: 'ACTIVE'
    },
    {
      label: 'Inactive',
      value: 'INACTIVE'
    },
    {
      label: 'On Leave',
      value: 'ON_LEAVE'
    }
  ];

  readonly specializationOptions = [
    {
      label: 'HVAC',
      value: 'HVAC'
    },
    {
      label: 'Electrical',
      value: 'Electrical'
    },
    {
      label: 'Plumbing',
      value: 'Plumbing'
    },
    {
      label: 'Refrigeration',
      value: 'Refrigeration'
    },
    {
      label: 'CCTV',
      value: 'CCTV'
    },
    {
      label: 'Solar',
      value: 'Solar'
    },
    {
      label: 'IT',
      value: 'IT'
    },
    {
      label: 'General Maintenance',
      value: 'General Maintenance'
    }
  ];

  ngOnInit(): void {

    this.initializeForm();

    this.technicianId =
      Number(this.route.snapshot.paramMap.get('id'));

    this.isEditMode =
      this.route.snapshot.url.some(
        segment => segment.path === 'edit'
      );

    if (
      this.isEditMode &&
      this.technicianId &&
      Number.isInteger(this.technicianId) &&
      this.technicianId > 0
    ) {
      this.loadTechnician(this.technicianId);
    }
  }

  private initializeForm(): void {

    this.technicianForm = this.fb.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      phone: [
        '',
        [
          Validators.required
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254)
        ]
      ],

      employeeCode: [
        '',
        [
          Validators.maxLength(50)
        ]
      ],

      specialization: [
        null
      ],

      status: [
        'ACTIVE',
        Validators.required
      ],

      notes: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ]

    });
  }

  private loadTechnician(id: number): void {

    this.loading.set(true);

    this.technicianService
      .getTechnicianById(id)
      .subscribe({

        next: (technician) => {

          this.technician = technician;

          this.technicianForm.patchValue({

            name: technician.name,

            phone: technician.phone,

            email: technician.email ?? '',

            employeeCode:
              technician.employeeCode ?? '',

            specialization:
              technician.specialization ?? null,

            status:
              technician.status,

            notes:
              technician.notes ?? ''

          });

          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load technician',
            error
          );

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to load technician.'
          });

          this.router.navigate([
            '/technicians'
          ]);
        }

      });
  }

  submit(): void {

    if (this.technicianForm.invalid) {

      this.technicianForm.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fix the highlighted fields.'
      });

      return;
    }

    const formValue =
      this.technicianForm.getRawValue();

    const request: TechnicianRequest = {

      name: formValue.name.trim(),

      phone: formValue.phone.trim(),

      email:
        formValue.email?.trim() || null,

      employeeCode:
        formValue.employeeCode?.trim() || null,

      specialization:
        formValue.specialization || null,

      status:
        formValue.status,

      notes:
        formValue.notes?.trim() || null
    };

    this.submitting = true;

    if (
      this.isEditMode &&
      this.technicianId
    ) {

      this.updateTechnician(
        this.technicianId,
        request
      );

    } else {

      this.createTechnician(request);
    }
  }

  private createTechnician(
    request: TechnicianRequest
  ): void {

    this.technicianService
      .createTechnician(request)
      .subscribe({

        next: (technician) => {
          if (technician.hasLoginAccount) {
            this.submitting = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Technician linked',
              detail: 'The existing technician login account has been linked to this profile.',
              life: 6000
            });
            this.router.navigate(['/technicians', technician.id]);
            return;
          }
          const email = (request.email ?? '').trim().toLowerCase();
          this.technicianService.inviteTechnicianAccount(technician.id, email, email).subscribe({
            next: () => {
              this.submitting = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Technician created and invited',
                detail: 'The technician profile is saved and an account invitation has been emailed. The login account will be linked when the technician accepts it.',
                life: 7000
              });
              this.router.navigate(['/technicians', technician.id]);
            },
            error: (error) => {
              this.submitting = false;
              this.messageService.add({
                severity: 'warn',
                summary: 'Profile created; invitation failed',
                detail: error?.error?.message ?? 'The technician profile was saved, but the login invitation could not be sent. Retry from user access management.',
                life: 8000
              });
              this.router.navigate(['/technicians', technician.id]);
            }
          });
        },

        error: (error) => {

          console.error(
            'Failed to create technician',
            error
          );

          this.submitting = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ??
              'Unable to create technician.'
          });
        }

      });
  }

  private updateTechnician(
    id: number,
    request: TechnicianRequest
  ): void {

    this.technicianService
      .updateTechnician(id, request)
      .subscribe({

        next: (technician) => {

          this.submitting = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Technician updated successfully.'
          });

          this.router.navigate([
            '/technicians',
            technician.id
          ]);
        },

        error: (error) => {

          console.error(
            'Failed to update technician',
            error
          );

          this.submitting = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              error?.error?.message ??
              'Unable to update technician.'
          });
        }

      });
  }

  cancel(): void {

    this.router.navigate([
      '/technicians'
    ]);
  }

  get isSubmitting(): boolean {
    return this.submitting;
  }
}