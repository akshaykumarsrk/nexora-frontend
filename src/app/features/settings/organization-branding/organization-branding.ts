import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { OrganizationBrandingService } from './organization-branding.service';
import { OrganizationBranding, OrganizationBrandingUpdate } from './organization-branding.model';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-organization-branding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization-branding.html',
  styleUrl: './organization-branding.css'
})
export class OrganizationBrandingComponent implements OnInit, OnDestroy {
  private readonly brandingService = inject(OrganizationBrandingService);
  private readonly authService = inject(AuthService);
  readonly canManageBranding = this.authService.isAdmin();
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly settings = signal<OrganizationBranding | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly removingLogo = signal(false);
  readonly errorMessage = signal('');
  readonly logoPreviewUrl = signal<string | null>(null);
  readonly hasLogo = computed(() => !!this.logoPreviewUrl());
  readonly hasSelectedFile = computed(() => !!this.selectedFile);

  useCompanyLogo = true;
  showNexoraAttribution = true;
  invoiceFooterText = '';
  receiptFooterText = '';
  private selectedFile: File | null = null;
  private objectUrl: string | null = null;

  ngOnInit(): void { this.loadSettings(); }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  loadSettings(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.brandingService.getSettings().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: settings => {
        this.settings.set(settings);
        this.useCompanyLogo = settings.useCompanyLogo;
        this.showNexoraAttribution = settings.showNexoraAttribution;
        this.invoiceFooterText = settings.invoiceFooterText ?? '';
        this.receiptFooterText = settings.receiptFooterText ?? '';
        if (settings.logoUrl && settings.useCompanyLogo) this.loadLogoPreview();
      },
      error: error => {
        this.errorMessage.set(this.readError(error, 'Could not load organization branding settings.'));
      }
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({ severity: 'warn', summary: 'Unsupported image', detail: 'Choose a PNG or JPEG image.' });
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.messageService.add({ severity: 'warn', summary: 'Image is too large', detail: 'The logo must be 2 MB or smaller.' });
      input.value = '';
      return;
    }
    this.selectedFile = file;
    this.setPreview(URL.createObjectURL(file));
  }

  uploadLogo(): void {
    if (!this.selectedFile || this.uploading()) return;
    this.uploading.set(true);
    this.brandingService.uploadLogo(this.selectedFile).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.uploading.set(false))
    ).subscribe({
      next: response => {
        this.settings.set(response);
        this.selectedFile = null;
        this.messageService.add({ severity: 'success', summary: 'Logo uploaded', detail: 'Your company logo has been saved.' });
        this.loadLogoPreview(true);
      },
      error: error => this.messageService.add({ severity: 'error', summary: 'Upload failed', detail: this.readError(error, 'Could not upload the logo.') })
    });
  }

  removeLogo(): void {
    if (this.removingLogo()) return;
    this.removingLogo.set(true);
    this.brandingService.removeLogo().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.removingLogo.set(false))
    ).subscribe({
      next: response => {
        this.settings.set(response);
        this.selectedFile = null;
        this.setPreview(null);
        this.useCompanyLogo = false;
        this.messageService.add({ severity: 'success', summary: 'Logo removed', detail: 'Documents will use the company name and details instead.' });
      },
      error: error => this.messageService.add({ severity: 'error', summary: 'Removal failed', detail: this.readError(error, 'Could not remove the logo.') })
    });
  }

  saveSettings(): void {
    if (this.saving()) return;
    const request: OrganizationBrandingUpdate = {
      useCompanyLogo: this.useCompanyLogo,
      showNexoraAttribution: this.showNexoraAttribution,
      invoiceFooterText: this.invoiceFooterText.trim(),
      receiptFooterText: this.receiptFooterText.trim()
    };
    this.saving.set(true);
    this.brandingService.updateSettings(request).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: response => {
        this.settings.set(response);
        this.messageService.add({ severity: 'success', summary: 'Settings saved', detail: 'Organization document branding has been updated.' });
      },
      error: error => this.messageService.add({ severity: 'error', summary: 'Save failed', detail: this.readError(error, 'Could not save branding settings.') })
    });
  }

  private loadLogoPreview(refresh = false): void {
    this.brandingService.getLogo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.setPreview(url);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 404 && !refresh) {
          this.messageService.add({ severity: 'warn', summary: 'Logo preview unavailable', detail: 'Settings loaded, but the logo preview could not be retrieved.' });
        }
      }
    });
  }

  private setPreview(url: string | null): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = url;
    this.logoPreviewUrl.set(url);
  }

  private readError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message ?? error.error?.detail;
      if (typeof message === 'string' && message.trim()) return message;
      if (error.status === 401) return 'Your session has expired. Please sign in again.';
      if (error.status === 403) return 'Your account does not have permission to manage this setting.';
    }
    return fallback;
  }
}
