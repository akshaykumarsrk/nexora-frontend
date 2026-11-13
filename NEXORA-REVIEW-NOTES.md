# NEXORA pre-demo review — 12 November 2026

## Changes applied in this review

### Frontend
- Fixed organization logo upload button state: selected file is now held in an Angular signal, so `hasSelectedFile()` updates when a file is selected.
- Prevented duplicate logo upload clicks while an upload is in progress.
- Set the stock movement quantity `p-inputNumber` host and inner input to full width, with a minimum of 1 and grouping disabled.
- Replaced the asset form's free-text Brand and Model fields with selectors populated from the existing Brands & Models catalog. The selected brand filters the model list.

### Backend
- Added `NEXORA_LOGO_DIRECTORY` configuration for organization logo storage in both normal and production properties.
- Invoice PDF no longer prints empty company address/email/phone values as `-`; missing contact details are omitted.

## Findings that still need action before production

### Gemini AI — confirmed upstream authentication failure
The supplied browser Network screenshot shows the backend reporting an upstream Gemini HTTP 401, then returning HTTP 502 to the frontend. This is not a frontend rendering issue. A valid Google AI Studio API key with Gemini API access must be configured as `NEXORA_AI_API_KEY` in the local backend and the deployed backend. Confirm `NEXORA_AI_ENABLED=true`, `NEXORA_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta`, and `NEXORA_AI_MODEL=gemini-2.5-flash`. Do not commit the key. The actual key value is not present in the supplied ZIP, so it cannot be repaired here.

### Invoice creation — production HTTP 500
The browser screenshot only contains the generic API error `500 An unexpected error occurred`; it does not include the backend exception. Production uses `spring.jpa.hibernate.ddl-auto=validate`, while local development defaults to `update`. The repository contains only migrations V1–V4 (employee/user account and subscription foundation); it does not contain checked-in migrations for the invoice/payment/catalog/branding/asset tables and columns. This makes a production schema mismatch a material possibility, but the exact cause must be confirmed from the deployed backend stack trace and database schema before applying a migration. Do not switch production to `ddl-auto=update` as a quick fix.

### Logo persistence
Configure `NEXORA_LOGO_DIRECTORY` to a persistent mounted disk path on the backend host. The default relative directory is not durable on hosts with ephemeral filesystems. Verify the deployed process can create/read files there.

### Brands & Models data relationship
The asset form now uses catalog options, but `Asset.brand` and `Asset.model` remain string columns in the backend entity/DTO. The chosen brand name and model number are stored as text. A true relational link requires adding brand/model IDs (with organization-scoped validation and a safe database migration), then updating asset DTOs, converters, services, details and historical-data migration. This review does not silently change the database contract.

### Subscription plans — not yet enforced as feature entitlements
The subscription page has proposed fallback plan cards. The backend currently supports listing active plans, retrieving the current subscription, and starting a 30-day trial. I did not find server-side feature gates or usage-limit enforcement on the business APIs. Therefore, the plans currently represent subscription/trial records and displayed pricing/features, not a complete enforced feature-tier system. Before selling plans, add server-side checks for feature access and limits (users, technicians, monthly jobs, etc.) and make the frontend display the server's entitlement state.

## Verification limitations
- Frontend build could not be run: the available runtime is Node 22.16.0, but the Angular 22.1 toolchain in this project declares Node `^22.22.3 || ^24.15.0 || >=26.0.0`; dependency installation did not complete.
- Backend compile/tests could not be run because Maven is not installed in the review environment.
- The production invoice 500 and Gemini 401 cannot be integration-tested without the deployed backend logs, valid API key, and production database access.

## Required pre-demo checks
1. Set a valid Gemini key in both local and deployed backend environments; restart and test the AI assistant.
2. Retrieve the backend stack trace for the failed POST `/api/invoices` request; compare the deployed database schema with the JPA entities before creating a migration.
3. Configure persistent logo storage, upload a PNG/JPEG, reload the settings page, and generate a new invoice/receipt PDF.
4. Test stock-in, stock-out and adjustment movements; confirm quantity-before/after and available quantity update correctly.
5. Create a brand and model, then create an asset using those selectors; verify the asset detail page shows the chosen values.
6. Do not advertise plan restrictions as enforced until backend entitlement checks are implemented.
