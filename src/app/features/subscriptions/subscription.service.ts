import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutRequest, CheckoutResponse, OrganizationSubscription, SubscriptionPlanApiResponse, TrialRequest } from './subscription.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subscriptions`;

  getPlans(): Observable<SubscriptionPlanApiResponse[]> {
    return this.http.get<SubscriptionPlanApiResponse[]>(`${this.baseUrl}/plans`);
  }

  getCurrentSubscription(): Observable<OrganizationSubscription | null> {
    return this.http.get<OrganizationSubscription | null>(`${this.baseUrl}/current`);
  }

  startTrial(request: TrialRequest): Observable<OrganizationSubscription> {
    return this.http.post<OrganizationSubscription>(`${this.baseUrl}/trial`, request);
  }

  createCheckout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.baseUrl}/checkout`, request);
  }
}
