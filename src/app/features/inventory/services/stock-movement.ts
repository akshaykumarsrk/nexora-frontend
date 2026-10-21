import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  StockMovement,
  StockMovementRequest
} from '../models/stock-movement';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/stock-movements`;

  getAllMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(this.apiUrl);
  }

  getMovementsByInventory(
    inventoryId: number
  ): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(
      `${this.apiUrl}/inventory/${inventoryId}`
    );
  }

  createMovement(
    request: StockMovementRequest
  ): Observable<StockMovement> {
    return this.http.post<StockMovement>(
      this.apiUrl,
      request
    );
  }
}