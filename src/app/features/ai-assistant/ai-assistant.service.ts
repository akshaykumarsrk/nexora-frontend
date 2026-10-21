import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface AiResponse { feature: string; result: string; model: string; }
export interface TechnicianAssistantRequest { issueDescription: string; assetType?: string; brandModel?: string; }
@Injectable({ providedIn: 'root' })
export class AiAssistantService {
 private readonly http = inject(HttpClient);
 private readonly baseUrl = `${environment.apiUrl}/ai`;
 askTechnicianAssistant(request: TechnicianAssistantRequest): Observable<AiResponse> { return this.http.post<AiResponse>(`${this.baseUrl}/technician-assistant`, request); }
 summarizeServiceRequest(id: number): Observable<AiResponse> { return this.http.get<AiResponse>(`${this.baseUrl}/service-requests/${id}/summary`); }
}
