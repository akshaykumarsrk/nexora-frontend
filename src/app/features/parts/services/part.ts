import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Part, PartRequest } from '../models/part';

@Injectable({
  providedIn: 'root'
})
export class PartService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/parts`;

  getAllParts(): Observable<Part[]> {
    return this.http.get<Part[]>(this.apiUrl);
  }

  getPartById(id: number): Observable<Part> {
    return this.http.get<Part>(
      `${this.apiUrl}/${id}`
    );
  }

  createPart(request: PartRequest): Observable<Part> {
    return this.http.post<Part>(
      this.apiUrl,
      request
    );
  }

  updatePart(
    id: number,
    request: PartRequest
  ): Observable<Part> {
    return this.http.put<Part>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deletePart(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}