import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  Inventory,
  InventoryRequest,
  UpdateInventoryRequest
} from '../models/inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/inventory`;

  // =========================================================
  // GET ALL
  // =========================================================

  getAllInventory(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.apiUrl);
  }

  // =========================================================
  // GET BY ID
  // =========================================================

  getInventoryById(id: number): Observable<Inventory> {
    return this.http.get<Inventory>(
      `${this.apiUrl}/${id}`
    );
  }

  // =========================================================
  // GET BY PART
  // =========================================================

  getInventoryByPartId(partId: number): Observable<Inventory> {
    return this.http.get<Inventory>(
      `${this.apiUrl}/part/${partId}`
    );
  }

  // =========================================================
  // CREATE
  // =========================================================

  createInventory(
    request: InventoryRequest
  ): Observable<Inventory> {

    return this.http.post<Inventory>(
      this.apiUrl,
      request
    );
  }

  // =========================================================
  // UPDATE
  // =========================================================

  updateInventory(
    id: number,
    request: UpdateInventoryRequest
  ): Observable<Inventory> {

    return this.http.put<Inventory>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // =========================================================
  // DEACTIVATE
  // =========================================================

  deactivateInventory(
    id: number
  ): Observable<void> {

    return this.http.patch<void>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }
}