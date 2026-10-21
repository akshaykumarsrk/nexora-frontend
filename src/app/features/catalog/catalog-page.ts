import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Brand, EquipmentModel } from './models';
import { CatalogService } from './services/catalog.service';
import { AuthService } from '../../core/services/auth';

@Component({ selector: 'app-catalog-page', standalone: true, imports: [FormsModule], templateUrl: './catalog-page.html', styleUrl: './catalog-page.css' })
export class CatalogPage implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly auth = inject(AuthService);
  canManageCatalog(): boolean { const role = this.auth.getRole(); return role === 'ADMIN' || role === 'MANAGER'; }
  readonly brands = signal<Brand[]>([]);
  readonly models = signal<EquipmentModel[]>([]);
  readonly loading = signal(false);
  readonly savingBrand = signal(false);
  readonly savingModel = signal(false);
  readonly editingBrandId = signal<number | null>(null);
  readonly editingModelId = signal<number | null>(null);
  readonly error = signal('');
  readonly success = signal('');

  brandName = ''; brandDescription = '';
  editBrandName = ''; editBrandDescription = ''; editBrandActive = true;
  modelBrandId = ''; modelType = ''; modelNumber = ''; modelDescription = '';
  editModelBrandId = ''; editModelType = ''; editModelNumber = ''; editModelDescription = ''; editModelActive = true;

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true); this.error.set('');
    this.catalog.getBrands().subscribe({
      next: brands => {
        this.brands.set(brands ?? []);
        this.catalog.getModels().pipe(finalize(() => this.loading.set(false))).subscribe({
          next: models => this.models.set(models ?? []),
          error: () => this.error.set('Could not load equipment models.')
        });
      },
      error: () => { this.error.set('Could not load catalog data. Check your connection and permissions.'); this.loading.set(false); }
    });
  }

  addBrand(): void {
    const name = this.brandName.trim(); if (!name || this.savingBrand()) return;
    this.savingBrand.set(true); this.error.set(''); this.success.set('');
    this.catalog.createBrand({ name, description: this.brandDescription.trim(), active: true }).pipe(finalize(() => this.savingBrand.set(false))).subscribe({
      next: brand => { this.brands.update(items => [...items, brand].sort((a,b) => a.name.localeCompare(b.name))); this.brandName = ''; this.brandDescription = ''; this.success.set('Brand added successfully.'); },
      error: e => this.error.set(e?.error?.message || 'Could not add brand. Admin or Manager access is required.')
    });
  }

  startEditBrand(brand: Brand): void {
    this.editingBrandId.set(brand.id); this.editBrandName = brand.name; this.editBrandDescription = brand.description ?? ''; this.editBrandActive = brand.active !== false; this.error.set(''); this.success.set('');
  }
  cancelEditBrand(): void { this.editingBrandId.set(null); }
  saveBrand(brand: Brand): void {
    const name = this.editBrandName.trim(); if (!name || this.savingBrand()) return;
    this.savingBrand.set(true); this.error.set(''); this.success.set('');
    this.catalog.updateBrand(brand.id, { name, description: this.editBrandDescription.trim(), active: this.editBrandActive }).pipe(finalize(() => this.savingBrand.set(false))).subscribe({
      next: updated => { this.brands.update(items => items.map(item => item.id === updated.id ? updated : item).sort((a,b) => a.name.localeCompare(b.name))); this.editingBrandId.set(null); this.success.set('Brand updated successfully.'); },
      error: e => this.error.set(e?.error?.message || 'Could not update brand.')
    });
  }
  toggleBrandActive(brand: Brand): void {
    const active = brand.active === false;
    this.catalog.updateBrand(brand.id, { name: brand.name, description: brand.description ?? '', active }).subscribe({
      next: updated => { this.brands.update(items => items.map(item => item.id === updated.id ? updated : item)); this.success.set(active ? 'Brand activated.' : 'Brand deactivated. Existing history is preserved.'); this.error.set(''); },
      error: e => this.error.set(e?.error?.message || 'Could not change brand status.')
    });
  }

  addModel(): void {
    const brandId = Number(this.modelBrandId); if (!brandId || !this.modelType.trim() || !this.modelNumber.trim() || this.savingModel()) return;
    this.savingModel.set(true); this.error.set(''); this.success.set('');
    this.catalog.createModel({ brandId, productType: this.modelType.trim(), modelNumber: this.modelNumber.trim(), description: this.modelDescription.trim(), active: true }).pipe(finalize(() => this.savingModel.set(false))).subscribe({
      next: model => { const brand = this.brands().find(item => item.id === brandId); this.models.update(items => [...items, { ...model, brandName: model.brandName || brand?.name }]); this.modelType = ''; this.modelNumber = ''; this.modelDescription = ''; this.success.set('Equipment model added successfully.'); },
      error: e => this.error.set(e?.error?.message || 'Could not add equipment model. Admin or Manager access is required.')
    });
  }
  startEditModel(model: EquipmentModel): void {
    this.editingModelId.set(model.id); this.editModelBrandId = String(model.brandId); this.editModelType = model.productType; this.editModelNumber = model.modelNumber; this.editModelDescription = model.description ?? ''; this.editModelActive = model.active !== false; this.error.set(''); this.success.set('');
  }
  cancelEditModel(): void { this.editingModelId.set(null); }
  saveModel(model: EquipmentModel): void {
    const brandId = Number(this.editModelBrandId); const productType = this.editModelType.trim(); const modelNumber = this.editModelNumber.trim();
    if (!brandId || !productType || !modelNumber || this.savingModel()) return;
    this.savingModel.set(true); this.error.set(''); this.success.set('');
    this.catalog.updateModel(model.id, { brandId, productType, modelNumber, description: this.editModelDescription.trim(), active: this.editModelActive }).pipe(finalize(() => this.savingModel.set(false))).subscribe({
      next: updated => { const brand = this.brands().find(item => item.id === updated.brandId); this.models.update(items => items.map(item => item.id === updated.id ? { ...updated, brandName: updated.brandName || brand?.name } : item)); this.editingModelId.set(null); this.success.set('Equipment model updated successfully.'); },
      error: e => this.error.set(e?.error?.message || 'Could not update equipment model.')
    });
  }
  toggleModelActive(model: EquipmentModel): void {
    const active = model.active === false;
    this.catalog.updateModel(model.id, { brandId: model.brandId, productType: model.productType, modelNumber: model.modelNumber, description: model.description ?? '', active }).subscribe({
      next: updated => { const brand = this.brands().find(item => item.id === updated.brandId); this.models.update(items => items.map(item => item.id === updated.id ? { ...updated, brandName: updated.brandName || brand?.name } : item)); this.success.set(active ? 'Model activated.' : 'Model deactivated. Existing history is preserved.'); this.error.set(''); },
      error: e => this.error.set(e?.error?.message || 'Could not change model status.')
    });
  }
}
