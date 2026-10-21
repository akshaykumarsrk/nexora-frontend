import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrganizationBranding, OrganizationBrandingUpdate } from './organization-branding.model';

@Injectable({ providedIn: 'root' })
export class OrganizationBrandingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/organization/branding`;

  getSettings(): Observable<OrganizationBranding> {
    return this.http.get<OrganizationBranding>(this.apiUrl);
  }

  updateSettings(request: OrganizationBrandingUpdate): Observable<OrganizationBranding> {
    return this.http.put<OrganizationBranding>(this.apiUrl, request);
  }

  uploadLogo(file: File): Observable<OrganizationBranding> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OrganizationBranding>(`${this.apiUrl}/logo`, formData);
  }

  removeLogo(): Observable<OrganizationBranding> {
    return this.http.delete<OrganizationBranding>(`${this.apiUrl}/logo`);
  }

  getLogo(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/logo`, { responseType: 'blob' });
  }
}
