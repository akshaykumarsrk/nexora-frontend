import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { SubscriptionService } from './subscription.service';
import { OrganizationSubscription, SubscriptionPlan } from './subscription.models';

const PROPOSED_PLANS: SubscriptionPlan[] = [
  {
    code: 'STARTER', name: 'Starter', description: 'For small service teams getting organized.',
    monthlyPriceInr: 699, annualPriceInr: 6990,
    features: ['Customer and site management', 'Service requests and jobs', 'Invoices and payment tracking', 'Parts and stock movement history', 'Basic operational dashboard'],
    limits: { maxUsers: 3, maxTechnicians: 2, maxJobsPerMonth: 100 }
  },
  {
    code: 'BUSINESS', name: 'Business', description: 'For growing teams managing daily service operations.',
    monthlyPriceInr: 1499, annualPriceInr: 14990, recommended: true,
    features: ['Everything in Starter', 'Up to 10 team users', 'More technicians and monthly jobs', 'Brands, models and equipment records', 'Reports and AI technician assistance'],
    limits: { maxUsers: 10, maxTechnicians: 8, maxJobsPerMonth: 500 }
  },
  {
    code: 'GROWTH', name: 'Growth', description: 'For established operations with larger teams.',
    monthlyPriceInr: 2999, annualPriceInr: 29990,
    features: ['Everything in Business', 'Up to 25 team users', 'Higher technician and job limits', 'Advanced operational visibility', 'Priority onboarding support'],
    limits: { maxUsers: 25, maxTechnicians: 20, maxJobsPerMonth: 2000 }
  }
];

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './subscription-page.html',
  styleUrl: './subscription-page.css'
})
export class SubscriptionPage implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  readonly plans = signal<SubscriptionPlan[]>(PROPOSED_PLANS);
  readonly current = signal<OrganizationSubscription | null>(null);
  readonly annual = signal(false);
  readonly loading = signal(true);
  readonly startingTrial = signal<string | null>(null);
  readonly apiConnected = signal(false);
  readonly pageError = signal('');
  readonly actionMessage = signal('');

  ngOnInit(): void {
    forkJoin({
      plans: this.subscriptionService.getPlans(),
      current: this.subscriptionService.getCurrentSubscription()
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ plans, current }) => {
        if (plans?.length) this.plans.set(plans);
        this.current.set(current);
        this.apiConnected.set(true);
      },
      error: (error: HttpErrorResponse) => {
        // Proposed plan cards remain visible while the backend endpoint is being implemented.
        // Current subscription state is never fabricated or stored in the browser.
        this.pageError.set(error.status === 0
          ? 'Subscription service is not reachable. Showing proposed pricing while API integration is pending.'
          : 'Could not load live subscription details. Proposed pricing is shown for planning only.');
      }
    });
  }

  price(plan: SubscriptionPlan): number {
    return this.annual() ? plan.annualPriceInr : plan.monthlyPriceInr;
  }

  intervalLabel(): string { return this.annual() ? 'year' : 'month'; }

  isCurrent(plan: SubscriptionPlan): boolean {
    return this.current()?.planCode === plan.code;
  }

  canStartTrial(): boolean {
    const subscription = this.current();
    return this.apiConnected() && !this.startingTrial() &&
      (!subscription || ['EXPIRED', 'CANCELLED'].includes(subscription.status));
  }

  startTrial(plan: SubscriptionPlan): void {
    this.actionMessage.set('');
    if (!this.apiConnected()) {
      this.actionMessage.set('Trial activation is not available yet because the subscription backend is not connected.');
      return;
    }
    if (!this.canStartTrial()) {
      this.actionMessage.set('Your organization already has a subscription or trial. Contact your administrator if you need help.');
      return;
    }
    this.startingTrial.set(plan.code);
    this.subscriptionService.startTrial({ planCode: plan.code })
      .pipe(finalize(() => this.startingTrial.set(null)))
      .subscribe({
        next: subscription => {
          this.current.set(subscription);
          this.actionMessage.set('Your trial has been activated.');
        },
        error: (error: HttpErrorResponse) => {
          this.actionMessage.set(error.error?.message || 'We could not start the trial. Please try again or contact support.');
        }
      });
  }
}
