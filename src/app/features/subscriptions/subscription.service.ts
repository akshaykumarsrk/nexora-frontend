import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationSubscription, SubscriptionPlan, TrialRequest } from './subscription.models';

/**
 * Organization subscription API client.
 * Expected backend endpoints:
 *   GET  /api/subscriptions/plans
 *   GET  /api/subscriptions/current
 *   POST /api/subscriptions/trial  { planCode }
 * The server must derive organization identity from the authenticated principal and enforce
 * the 30-day trial policy itself; never accept organizationId or trialDays from the browser.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subscriptions`;

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.baseUrl}/plans`);
  }

  getCurrentSubscription(): Observable<OrganizationSubscription | null> {
    return this.http.get<OrganizationSubscription | null>(`${this.baseUrl}/current`);
  }

  startTrial(request: TrialRequest): Observable<OrganizationSubscription> {
    return this.http.post<OrganizationSubscription>(`${this.baseUrl}/trial`, request);
  }
}
