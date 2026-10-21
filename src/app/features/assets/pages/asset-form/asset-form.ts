import {
  Component,
  OnInit,
  computed,
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

import {
  MessageService
} from 'primeng/api';

import {
  ButtonModule
} from 'primeng/button';

import {
  InputTextModule
} from 'primeng/inputtext';

import {
  TextareaModule
} from 'primeng/textarea';

import {
  SelectModule
} from 'primeng/select';

import {
  DatePickerModule
} from 'primeng/datepicker';

import {
  ToastModule
} from 'primeng/toast';

import {
  Asset,
  AssetRequest
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


@Component({
  selector: 'app-asset-form',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ToastModule
  ],

  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css'
})
export class AssetForm implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly assetService =
    inject(AssetService);

  private readonly siteService =
    inject(SiteService);

  private readonly messageService =
    inject(MessageService);


  /* ======================================================
     STATE
     ====================================================== */

  readonly asset =
    signal<Asset | null>(null);

  readonly sites =
    signal<Site[]>([]);

  readonly editing =
    signal(false);

  readonly loading =
    signal(false);

  readonly sitesLoading =
    signal(false);

  readonly saving =
    signal(false);

  readonly assetId =
    signal<number | null>(null);


  /* ======================================================
     FORM
     ====================================================== */

  assetForm!: FormGroup;


  /* ======================================================
     STATUS OPTIONS
     ======================================================

     These are UI choices only.

     The backend currently accepts any non-blank
     status string; it does not define an enum.
  */

  readonly statusOptions = [
    {
      label: 'Active',
      value: 'Active'
    },
    {
      label: 'Inactive',
      value: 'Inactive'
    },
    {
      label: 'Under Maintenance',
      value: 'Under Maintenance'
    },
    {
      label: 'Retired',
      value: 'Retired'
    }
  ];


  /* ======================================================
     SITE OPTIONS
     ====================================================== */

  readonly siteOptions =
    computed(() =>
      this.sites().map(site => ({
        label: site.name,
        value: site.id
      }))
    );


  /* ======================================================
     SELECTED SITE
     ====================================================== */

  readonly selectedSite =
    computed(() => {

      if (!this.assetForm) {
        return null;
      }

      const siteId =
        this.assetForm.get('siteId')?.value;

      if (!siteId) {
        return null;
      }

      return this.sites()
        .find(site => site.id === Number(siteId))
        ?? null;
    });


  /* ======================================================
     INIT
     ====================================================== */

  ngOnInit(): void {

    this.initializeForm();

    this.loadSites();

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {

      this.editing.set(true);

      this.assetId.set(
        Number(id)
      );

      this.loadAsset(
        Number(id)
      );
    }
  }


  /* ======================================================
     FORM INITIALIZATION
     ====================================================== */

  private initializeForm(): void {

    this.assetForm =
      this.fb.group({

        siteId: [
          null,
          Validators.required
        ],

        assetCode: [
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
          Validators.maxLength(150)
        ],

        brand: [
          '',
          Validators.maxLength(150)
        ],

        model: [
          '',
          Validators.maxLength(150)
        ],

        serialNumber: [
          '',
          Validators.maxLength(150)
        ],

        installationDate: [
          null
        ],

        warrantyEndDate: [
          null
        ],

        status: [
          'Active',
          Validators.required
        ],

        notes: [
          '',
          Validators.maxLength(1000)
        ]
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

          this.messageService.add({
            severity: 'error',
            summary: 'Unable to Load Sites',
            detail:
              'Sites could not be loaded. Please try again.'
          });
        }
      });
  }


  /* ======================================================
     LOAD ASSET
     ====================================================== */

  private loadAsset(
    id: number
  ): void {

    this.loading.set(true);

    this.assetService
      .getAssetById(id)
      .subscribe({

        next: asset => {

          this.asset.set(asset);

          this.patchForm(asset);

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load asset',
            error
          );

          this.loading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Unable to Load Asset',
            detail:
              'The requested asset could not be loaded.'
          });

          setTimeout(() => {
            this.router.navigate(['/assets']);
          }, 1200);
        }
      });
  }


  /* ======================================================
     PATCH FORM
     ====================================================== */

  private patchForm(
    asset: Asset
  ): void {

    this.assetForm.patchValue({

      siteId:
        asset.siteId,

      assetCode:
        asset.assetCode,

      name:
        asset.name,

      category:
        asset.category ?? '',

      brand:
        asset.brand ?? '',

      model:
        asset.model ?? '',

      serialNumber:
        asset.serialNumber ?? '',

      installationDate:
        this.toDate(asset.installationDate),

      warrantyEndDate:
        this.toDate(asset.warrantyEndDate),

      status:
        asset.status,

      notes:
        asset.notes ?? ''
    });
  }


  /* ======================================================
     DATE CONVERSION
     ====================================================== */

  private toDate(
    value?: string | null
  ): Date | null {

    if (!value) {
      return null;
    }

    return new Date(
      `${value}T00:00:00`
    );
  }


  private toLocalDateString(
    value: Date | string | null
  ): string | null {

    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        value.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  /* ======================================================
     SUBMIT
     ====================================================== */

  onSubmit(): void {

    if (this.assetForm.invalid) {

      this.assetForm.markAllAsTouched();

      return;
    }

    const formValue =
      this.assetForm.getRawValue();


    const request: AssetRequest = {

      siteId:
        Number(formValue.siteId),

      assetCode:
        formValue.assetCode.trim(),

      name:
        formValue.name.trim(),

      category:
        this.cleanValue(
          formValue.category
        ),

      brand:
        this.cleanValue(
          formValue.brand
        ),

      model:
        this.cleanValue(
          formValue.model
        ),

      serialNumber:
        this.cleanValue(
          formValue.serialNumber
        ),

      installationDate:
        this.toLocalDateString(
          formValue.installationDate
        ),

      warrantyEndDate:
        this.toLocalDateString(
          formValue.warrantyEndDate
        ),

      status:
        formValue.status,

      notes:
        this.cleanValue(
          formValue.notes
        )
    };


    this.saving.set(true);


    if (this.editing()) {

      this.updateAsset(
        this.assetId()!,
        request
      );

    } else {

      this.createAsset(
        request
      );
    }
  }


  /* ======================================================
     CREATE
     ====================================================== */

  private createAsset(
    request: AssetRequest
  ): void {

    this.assetService
      .createAsset(request)
      .subscribe({

        next: asset => {

          this.saving.set(false);

          this.messageService.add({

            severity: 'success',

            summary: 'Asset Created',

            detail:
              `${asset.name} was created successfully.`
          });

          setTimeout(() => {

            this.router.navigate([
              '/assets',
              asset.id
            ]);

          }, 600);
        },

        error: error => {

          console.error(
            'Failed to create asset',
            error
          );

          this.saving.set(false);

          this.handleSaveError(
            error
          );
        }
      });
  }


  /* ======================================================
     UPDATE
     ====================================================== */

  private updateAsset(
    id: number,
    request: AssetRequest
  ): void {

    this.assetService
      .updateAsset(
        id,
        request
      )
      .subscribe({

        next: asset => {

          this.asset.set(asset);

          this.saving.set(false);

          this.messageService.add({

            severity: 'success',

            summary: 'Asset Updated',

            detail:
              `${asset.name} was updated successfully.`
          });

          setTimeout(() => {

            this.router.navigate([
              '/assets',
              asset.id
            ]);

          }, 600);
        },

        error: error => {

          console.error(
            'Failed to update asset',
            error
          );

          this.saving.set(false);

          this.handleSaveError(
            error
          );
        }
      });
  }


  /* ======================================================
     ERROR HANDLING
     ====================================================== */

  private handleSaveError(
    error: any
  ): void {

    let detail =
      'Unable to save the asset. Please try again.';

    if (
      error?.error?.message
    ) {

      detail =
        error.error.message;
    }

    this.messageService.add({

      severity: 'error',

      summary: 'Save Failed',

      detail
    });
  }


  /* ======================================================
     CLEAN VALUES
     ====================================================== */

  private cleanValue(
    value: string | null | undefined
  ): string | null {

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    const trimmed =
      value.trim();

    return trimmed
      ? trimmed
      : null;
  }


  /* ======================================================
     VALIDATION
     ====================================================== */

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.assetForm.get(
        controlName
      );

    return !!(
      control &&
      control.invalid &&
      control.touched
    );
  }


  getErrorMessage(
    controlName: string
  ): string {

    const control =
      this.assetForm.get(
        controlName
      );

    if (!control?.errors) {
      return '';
    }

    if (
      control.errors['required']
    ) {

      switch (controlName) {

        case 'siteId':
          return 'Site is required.';

        case 'assetCode':
          return 'Asset code is required.';

        case 'name':
          return 'Asset name is required.';

        case 'status':
          return 'Asset status is required.';

        default:
          return 'This field is required.';
      }
    }

    if (
      control.errors['maxlength']
    ) {

      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;
    }

    return 'Invalid value.';
  }


  /* ======================================================
     CANCEL
     ====================================================== */

  cancel(): void {

    this.router.navigate([
      '/assets'
    ]);
  }
}