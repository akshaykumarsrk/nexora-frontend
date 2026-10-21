import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Technician,
  TechnicianRequest
} from '../models/technician';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/technicians`;

  getAllTechnicians(): Observable<Technician[]> {
    return this.http.get<Technician[]>(this.apiUrl);
  }

  getTechnicianById(id: number): Observable<Technician> {
    return this.http.get<Technician>(
      `${this.apiUrl}/${id}`
    );
  }

  inviteTechnicianAccount(technicianId: number, email: string, username: string): Observable<{ message: string; expiresAt: string }> {
    return this.http.post<{ message: string; expiresAt: string }>(
      `${environment.apiUrl}/users/invitations`,
      { email, username, role: 'TECHNICIAN', technicianId }
    );
  }

  createTechnician(
    request: TechnicianRequest
  ): Observable<Technician> {
    return this.http.post<Technician>(
      this.apiUrl,
      request
    );
  }

  updateTechnician(
    id: number,
    request: TechnicianRequest
  ): Observable<Technician> {
    return this.http.put<Technician>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteTechnician(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}