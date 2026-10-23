# NEXORA branding follow-up

## Changes
- Updated the public landing page header and footer to use the shared `/favicon.svg` NEXORA brand icon instead of a separately styled letter N.
- Confirmed the shared sidebar and workspace breadcrumb already use `/favicon.svg`.
- Authentication pages (login, registration, invitation acceptance, forgot password and reset password) already use `/favicon.svg`.
- The top-right profile circle intentionally displays the signed-in user's initials (`avatarInitial()`), not the company/platform logo. It is kept as a user identity/avatar control; replacing it with the NEXORA logo would make it look like a shared account avatar.

## PrimeUI license notice
The visible `Invalid PrimeUI License` warning is not a NEXORA logo. It does not appear as authored text in the Angular source and is likely emitted by a dependency at runtime. Do not hide it with CSS as a substitute for resolving its license/configuration. Check the applicable PrimeUI license and configure a valid key or replace the package/component that emits the warning.

## Validate locally
```powershell
npm run build
```

## Git commands
```powershell
git status
git add src/app/features/public-home/public-home.ts
git commit -m "Use shared NEXORA logo on landing page"
git push origin main
```
