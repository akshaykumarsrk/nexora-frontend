# NEXORA Subscription Foundation — Backend Implementation Contract

## Scope in this frontend delivery

- Adds an authenticated `/subscription` page and sidebar navigation entry.
- Adds typed Angular models and a `SubscriptionService` using `environment.apiUrl`.
- Uses provisional Starter / Business / Growth pricing cards when the subscription API is not yet available. These prices and limits are planning values only, not authoritative billing configuration.
- Does not collect money or pretend a trial has started. The trial button stays disabled until the backend's plans and current-subscription endpoints both respond successfully.

## Required API contract

All endpoints are under the configured API base URL and require an authenticated session unless explicitly documented otherwise.

### `GET /subscriptions/plans`
Returns active plans, configured server-side. Example:

```json
[
  {
    "code": "STARTER",
    "name": "Starter",
    "description": "For small service teams getting organized.",
    "monthlyPriceInr": 699,
    "annualPriceInr": 6990,
    "features": ["Customer and site management"],
    "limits": { "maxUsers": 3, "maxTechnicians": 2, "maxJobsPerMonth": 100 }
  }
]
```

### `GET /subscriptions/current`
Returns the subscription for the organization resolved from the authenticated principal, or JSON `null` if no subscription exists. Never accept an arbitrary `organizationId` query parameter for this endpoint.

### `POST /subscriptions/trial`
Request body:

```json
{ "planCode": "BUSINESS" }
```

The server must enforce the fixed 30-day trial duration. It must not trust a browser-provided `trialDays`, `trialEndAt`, `organizationId`, status, or price. Derive organization and actor from the security context. Return the created/current subscription DTO.

## Suggested persistence model

- `subscription_plan`: code, name, enabled, monthly/annual price in minor currency units, feature configuration, limits, created/updated timestamps.
- `organization_subscription`: organization FK, plan FK/code, status, billing interval, trial start/end, current period start/end, cancel-at-period-end, created/updated timestamps, optimistic version.
- Optional future `subscription_event` / `billing_event` table for idempotent provider webhook processing and an auditable status history.

Enforce one current subscription per organization using a database constraint or transactional service logic. Match the existing project's tenant/organization entity conventions once integrated into the backend repository.

## Required security and business rules

1. Only an authorized organization owner/admin can start or change a subscription; verify actual role names in the backend.
2. Resolve tenant identity from the authenticated principal, never from user-supplied organization IDs.
3. A 30-day trial may be granted once per organization unless an explicitly audited administrative override exists.
4. Make trial creation transactional and race-safe so concurrent requests cannot create duplicate trials.
5. The backend, not Angular, enforces plan limits on every relevant create/update API. UI hiding is not enforcement.
6. Never accept price, plan limits, or subscription status from a client as authoritative.
7. Payment integration is deliberately out of scope for this step. Before paid launch, verify provider signatures, webhook authenticity, idempotency, amount/currency, payment state transitions, renewal failures, cancellation, and reconciliation.
8. Return safe, structured errors (e.g. `TRIAL_ALREADY_USED`, `SUBSCRIPTION_ALREADY_ACTIVE`, `PLAN_NOT_AVAILABLE`) without leaking other organizations' data.
9. Add integration tests for tenant isolation, role checks, one-trial-only, trial expiry boundaries, concurrent trial creation, plan-limit enforcement, and unauthorized organization ID spoofing.

## Frontend endpoint mapping

- `SubscriptionService.getPlans()` -> `GET /subscriptions/plans`
- `SubscriptionService.getCurrentSubscription()` -> `GET /subscriptions/current`
- `SubscriptionService.startTrial({ planCode })` -> `POST /subscriptions/trial`

## Remaining work

The uploaded project ZIP is Angular-only; it does not include `pom.xml` or the Spring Boot source tree. Therefore this delivery adds the typed frontend API foundation and contract, but cannot safely implement or test the actual Java persistence, controller, authorization, or transaction code. Integrate the contract into the latest backend ZIP before enabling trial activation.
