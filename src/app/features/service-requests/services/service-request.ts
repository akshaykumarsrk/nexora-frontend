import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  ServiceRequest,
  ServiceRequestRequest
} from '../models/service-request';

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/service-requests`;


  // =========================================================
  // GET ALL SERVICE REQUESTS
  // =========================================================

  getAllServiceRequests(): Observable<ServiceRequest[]> {

    return this.http.get<ServiceRequest[]>(
      this.apiUrl
    );
  }


  // =========================================================
  // GET SERVICE REQUEST BY ID
  // =========================================================

  getServiceRequestById(
    id: number
  ): Observable<ServiceRequest> {

    return this.http.get<ServiceRequest>(
      `${this.apiUrl}/${id}`
    );
  }


  // =========================================================
  // CREATE SERVICE REQUEST
  // =========================================================

  createServiceRequest(
    request: ServiceRequestRequest
  ): Observable<ServiceRequest> {

    return this.http.post<ServiceRequest>(
      this.apiUrl,
      request
    );
  }


  // =========================================================
  // UPDATE SERVICE REQUEST
  // =========================================================

  updateServiceRequest(
    id: number,
    request: ServiceRequestRequest
  ): Observable<ServiceRequest> {

    return this.http.put<ServiceRequest>(
      `${this.apiUrl}/${id}`,
      request
    );
  }
}