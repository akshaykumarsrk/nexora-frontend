# NEXORA review — 12 November 2026

## Source reviewed
- Latest uploaded frontend archive: `nexora-frontend-compile-fix (1).zip`
- Latest uploaded backend archive: `nexora-backend-reviewed(1).zip`

## Safe UI fix applied
- Asset model dropdown custom option template now stacks model number and product type on separate lines. Previously the `<strong>` and `<small>` elements had no layout rule, so they rendered inline and appeared concatenated (for example `183-TVtv`).

## Verified findings

### Assets and catalog
- Frontend loads brands and equipment models from `/api/catalog/brands` and `/api/catalog/equipment-models`.
- The Asset form filters active models by the selected brand and clears the selected model when the brand changes.
- The Asset request currently submits `brand` and `model` as strings.
- Backend `Asset.brand` and `Asset.model` are plain `String` columns. They are not foreign keys to `catalog_brands` or `equipment_models`.
- Therefore catalog selection is currently a convenience for data entry; an asset does not maintain a relational link to the catalog. The robust fix needs an additive database migration, request/response DTO changes, organization-scoped brand/model validation, and a legacy-data migration strategy. Do not simply change entity fields without migrating existing data.

### Stock movements
- The latest frontend source already includes a visible Quantity number input in the New Stock Movement dialog.
- The reactive form has `Validators.required` and `Validators.min(1)`.
- The backend rejects non-positive stock-in and stock-out quantities and validates stock availability/reserved quantity. Adjustment uses the entered quantity as the target physical count and requires a reason.
- The earlier `p-inputNumber` binding compile errors are not present in this uploaded source; this version uses a native `input type="number"`.

### Subscription plans and authorization
- Subscription APIs currently expose plans, current organization subscription, and ADMIN-only trial activation.
- The backend persists plan limits (`maxUsers`, `maxTechnicians`, `maxJobsPerMonth`) and returns them to the frontend.
- A repository-wide source search found no plan-feature entitlement service, no `hasFeature` checks, and no usage-limit checks in user/technician/job creation services.
- Angular routes are protected by `authGuard`, but no plan entitlement route guard was found.
- Consequently plan cards/pricing are not enforcing feature access. A Starter customer is not currently guaranteed to be blocked from Business/Growth functionality. UI hiding alone would not be sufficient; backend endpoints must enforce entitlements too.
- The subscription UI intentionally displays proposed fallback prices if the API is unavailable. Current seeded/fallback values are Starter ₹699, Business ₹1,499, Growth ₹2,999 monthly; these should not be advertised as final commercial prices until confirmed.
- Backend integration notes explicitly state there is no payment provider/webhook, cancellation/renewal workflow, or automatic expiry enforcement yet.

### AI assistant
- Frontend calls `POST /api/ai/technician-assistant` and `GET /api/ai/service-requests/{id}/summary`.
- Backend reads `nexora.ai.enabled`, `nexora.ai.api-key`, `nexora.ai.base-url`, and `nexora.ai.model`.
- Production profile defaults AI to disabled. Render must have `NEXORA_AI_ENABLED=true` and a valid `NEXORA_AI_API_KEY`; model/base URL can use documented defaults.
- Backend diagnostics distinguish upstream Gemini HTTP errors from transport failures. The uploaded source alone cannot establish the current Render environment values or prove why a live request is failing.

### Invoice and payment PDFs
- Both invoice and receipt PDF generation are implemented using OpenPDF and include organization logo/identity when branding is configured.
- Invoice includes invoice metadata, customer section, charge breakdown and totals.
- Receipt includes organization details, receipt/payment details, invoice reference, amount received and balance information.
- The screenshot's Facebook logo is the organization's configured branding asset, not a built-in NEXORA mark. Update Organization Branding to the correct logo.
- The current models do not show fields for every possible legal/tax document detail (for example GSTIN, PAN, place of supply, HSN/SAC, tax registration and payment terms). These must be added/configured before claiming a jurisdiction-complete tax invoice.

## Build validation
- `npm ci` did not finish within the available execution window.
- The execution environment used Node `v22.16.0`, below the Angular 22.1 toolchain engine requirement (`^22.22.3 || ^24.15.0 || >=26.0.0`).
- No successful Angular build is claimed. Run `npm ci` and `npm run build` under a supported Node version (the user's Node 26.x environment is suitable if it meets the listed engine range).
- Maven compile/test was not run in this review environment.

## Recommended implementation order
1. Complete a supported-Node frontend install/build and resolve any actual compiler errors.
2. Add relational brand/model references to Asset using an additive migration and backward-compatible DTO handling.
3. Implement a centralized backend subscription entitlement service, feature keys per plan, usage-limit enforcement, and frontend entitlement-aware navigation/guards.
4. Add subscription expiry enforcement and payment-provider/webhook lifecycle before enabling paid checkout.
5. Diagnose live AI using Render environment configuration and one failing Network response/log trace.
6. Upgrade invoice/receipt legal fields after confirming which organization/customer tax fields NEXORA intends to collect.
