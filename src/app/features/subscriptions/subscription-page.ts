import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { SubscriptionService } from './subscription.service';
import { OrganizationSubscription, SubscriptionPlan, SubscriptionPlanApiResponse } from './subscription.models';

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
  readonly checkingOut = signal<string | null>(null);
  readonly apiConnected = signal(false);
  readonly pageError = signal('');
  readonly actionMessage = signal('');

  ngOnInit(): void {
    forkJoin({
      plans: this.subscriptionService.getPlans(),
      current: this.subscriptionService.getCurrentSubscription()
    }).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: ({ plans, current }) => {
        if (plans?.length) this.plans.set(this.mergeServerPlans(plans));
        this.current.set(current);
        this.apiConnected.set(true);
      },
      error: (error: HttpErrorResponse) => {
        // Keep the server as the source of truth; do not fabricate subscription state in the browser.
        this.pageError.set(error.status === 0
          ? 'Subscription service is not reachable. Please check the backend deployment and API URL.'
          : 'Could not load live subscription details. Please refresh or contact your administrator.');
      }
    });
  }

  /**
   * The backend DTO intentionally exposes flat fields (monthlyPrice, maxUsers, etc.),
   * while the page view model groups limits and uses INR-specific price names.
   * Merge server-owned prices/limits into the local presentation metadata so the
   * template never dereferences a missing `plan.limits` object.
   */
  private mergeServerPlans(serverPlans: SubscriptionPlanApiResponse[]): SubscriptionPlan[] {
    const presentationByCode = new Map(PROPOSED_PLANS.map(plan => [plan.code, plan]));
    const rows = Array.isArray(serverPlans) ? serverPlans : [];

    return rows.map((raw: SubscriptionPlanApiResponse & { limits?: Partial<SubscriptionPlan['limits']>; monthlyPriceInr?: number; annualPriceInr?: number; features?: string[] }) => {
      const code = String(raw?.code ?? '').toUpperCase() as SubscriptionPlan['code'];
      const presentation = presentationByCode.get(code);
      const nestedLimits = raw?.limits ?? {};
      const numberOr = (value: unknown, fallback: number): number => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      };

      return {
        ...(presentation ?? {
          code,
          name: raw?.name ?? code,
          description: raw?.description ?? '',
          monthlyPriceInr: 0,
          annualPriceInr: 0,
          features: [],
          limits: { maxUsers: 0, maxTechnicians: 0, maxJobsPerMonth: 0 }
        }),
        code,
        name: raw?.name || presentation?.name || code,
        description: raw?.description || presentation?.description || '',
        monthlyPriceInr: numberOr(raw?.monthlyPrice ?? raw?.monthlyPriceInr, presentation?.monthlyPriceInr ?? 0),
        annualPriceInr: numberOr(raw?.annualPrice ?? raw?.annualPriceInr, presentation?.annualPriceInr ?? 0),
        features: Array.isArray(raw?.features) ? raw.features : (presentation?.features ?? []),
        limits: {
          maxUsers: numberOr(nestedLimits.maxUsers ?? raw?.maxUsers, presentation?.limits.maxUsers ?? 0),
          maxTechnicians: numberOr(nestedLimits.maxTechnicians ?? raw?.maxTechnicians, presentation?.limits.maxTechnicians ?? 0),
          maxJobsPerMonth: numberOr(nestedLimits.maxJobsPerMonth ?? raw?.maxJobsPerMonth, presentation?.limits.maxJobsPerMonth ?? 0)
        }
      };
    }).filter(plan => Boolean(plan.code));
  }

  setBillingInterval(interval: 'MONTHLY' | 'ANNUAL'): void {
    this.annual.set(interval === 'ANNUAL');
  }

  price(plan: SubscriptionPlan): number {
    const amount = this.annual() ? plan.annualPriceInr : plan.monthlyPriceInr;
    return Number.isFinite(Number(amount)) ? Number(amount) : 0;
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

  selectPlan(plan: SubscriptionPlan): void {
    if (!this.current() && plan.code === 'STARTER') {
      this.startTrial(plan);
      return;
    }
    this.beginCheckout(plan);
  }

  private beginCheckout(plan: SubscriptionPlan): void {
    this.actionMessage.set('');
    if (!this.apiConnected()) {
      this.actionMessage.set('Subscription service is not connected. Please refresh and try again.');
      return;
    }
    if (this.checkingOut() || this.startingTrial()) return;

    const billingInterval = this.annual() ? 'ANNUAL' : 'MONTHLY';
    this.checkingOut.set(plan.code);
    this.subscriptionService.createCheckout({ planCode: plan.code, billingInterval })
      .pipe(finalize(() => this.checkingOut.set(null)))
      .subscribe({
        next: response => {
          if (!response?.shortUrl || !response.shortUrl.startsWith('https://')) {
            this.actionMessage.set('Razorpay did not return a valid checkout link. Please contact support.');
            return;
          }
          window.location.assign(response.shortUrl);
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error?.message || error.error?.detail ||
            (error.status === 401 ? 'Your login session has expired. Please sign in again.' :
             error.status === 403 ? 'Only your organization administrator can change the subscription.' :
             'We could not start Razorpay checkout. Please verify the payment configuration and try again.');
          this.actionMessage.set(message);
        }
      });
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
