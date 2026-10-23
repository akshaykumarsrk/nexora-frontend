# NEXORA branding and profile follow-up

## Workspace identity
- The public landing page header and footer use the shared `/favicon.svg` NEXORA brand icon.
- The sidebar and workspace breadcrumb use the same shared NEXORA icon.
- Authentication pages use the shared NEXORA icon.
- The top-right profile circle intentionally displays the signed-in user's initials and name/role; it is not a platform-logo slot.
- The `/profile` route is authenticated and linked from the profile menu. The Profile page displays the authenticated username and role, and supports password changes through the existing `PATCH /api/users/me/password` contract.
- No verified backend contract currently exists in this frontend for editing profile name, email, or avatar. The UI explains this rather than presenting fields that cannot be saved.

## PrimeUI license notice

The project uses `primeng@22.1.0`. PrimeNG 22 is part of the PrimeUI licensing transition, so the `Invalid PrimeUI License` notice is emitted by the dependency and is not a NEXORA logo or an authored Angular message. Do not suppress it with CSS or bypass license verification. Configure a valid license key for the applicable PrimeUI license at https://primeui.dev/licenses/community or https://primeui.dev/licenses/commercial. If NEXORA will not use PrimeUI 22, evaluate a compatible, tested migration to an MIT-licensed PrimeNG release or another component library.

## Validate locally

```powershell
npm ci
npm run build
npm test
```

## Git commands

```powershell
git status
git add src/app/features/profile/profile-page.ts NEXORA-FRONTEND-BACKEND-INTEGRATION-AUDIT.md BRANDING-FOLLOWUP.md
git commit -m "Polish profile page and document PrimeUI licensing"
git push origin main
```
