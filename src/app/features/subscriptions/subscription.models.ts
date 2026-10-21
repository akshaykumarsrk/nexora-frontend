/** API contracts for organization-level NEXORA subscriptions. Keep trial duration server-controlled. */
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | 'INCOMPLETE';
export type BillingInterval = 'MONTHLY' | 'ANNUAL';

export interface SubscriptionPlan {
  code: 'STARTER' | 'BUSINESS' | 'GROWTH';
  name: string;
  description: string;
  monthlyPriceInr: number;
  annualPriceInr: number;
  features: string[];
  limits: {
    maxUsers: number;
    maxTechnicians: number;
    maxJobsPerMonth: number;
  };
  recommended?: boolean;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planCode: SubscriptionPlan['code'];
  status: SubscriptionStatus;
  billingInterval: BillingInterval | null;
  trialStartAt: string | null;
  trialEndAt: string | null;
  currentPeriodStartAt: string | null;
  currentPeriodEndAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface TrialRequest {
  planCode: SubscriptionPlan['code'];
}

export interface SubscriptionApiError {
  message?: string;
  code?: string;
}
