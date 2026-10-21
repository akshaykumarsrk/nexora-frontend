import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Brand, BrandRequest, EquipmentModel, EquipmentModelRequest } from '../models';
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/catalog`;
  getBrands(): Observable<Brand[]> { return this.http.get<Brand[]>(`${this.base}/brands`); }
  createBrand(request: BrandRequest): Observable<Brand> { return this.http.post<Brand>(`${this.base}/brands`, request); }
  updateBrand(id: number, request: BrandRequest): Observable<Brand> { return this.http.put<Brand>(`${this.base}/brands/${id}`, request); }
  getModels(brandId?: number): Observable<EquipmentModel[]> { const params = brandId ? new HttpParams().set('brandId', brandId) : undefined; return this.http.get<EquipmentModel[]>(`${this.base}/equipment-models`, { params }); }
  createModel(request: EquipmentModelRequest): Observable<EquipmentModel> { return this.http.post<EquipmentModel>(`${this.base}/equipment-models`, request); }
  updateModel(id: number, request: EquipmentModelRequest): Observable<EquipmentModel> { return this.http.put<EquipmentModel>(`${this.base}/equipment-models/${id}`, request); }
}
