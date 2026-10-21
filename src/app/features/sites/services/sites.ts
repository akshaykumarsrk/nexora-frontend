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
  Site,
  SiteRequest
} from '../models/site';


@Injectable({
  providedIn: 'root'
})
export class SiteService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/sites`;


  getAllSites(): Observable<Site[]> {

    return this.http.get<Site[]>(
      this.apiUrl
    );
  }


  getSiteById(
    id: number
  ): Observable<Site> {

    return this.http.get<Site>(
      `${this.apiUrl}/${id}`
    );
  }


  getSitesByCustomer(
    customerId: number
  ): Observable<Site[]> {

    return this.http.get<Site[]>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }


  createSite(
    request: SiteRequest
  ): Observable<Site> {

    return this.http.post<Site>(
      this.apiUrl,
      request
    );
  }


  updateSite(
    id: number,
    request: SiteRequest
  ): Observable<Site> {

    return this.http.put<Site>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  deleteSite(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}