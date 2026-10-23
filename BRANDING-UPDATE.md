# NEXORA branding update

This update applies the shared NEXORA SVG mark to the sidebar, workspace top bar, and authentication screens. It also updates the document title and description. The existing favicon, mobile touch icon, app icons, and web manifest are retained.

## Apply / deploy

1. Merge these changes into the current frontend repository (do not replace your repository with this ZIP if it contains newer local changes).
2. Build with the Node version required by the project's Angular 22 toolchain, then deploy to Vercel.
3. If an installed mobile shortcut still shows the old icon, remove the old shortcut and add the site to the home screen again after deployment.

## Git commands

```bash
git status
git add src/index.html src/app/layout/sidebar/sidebar.html src/app/layout/sidebar/sidebar.css src/app/layout/topbar/topbar.html src/app/layout/topbar/topbar.css src/app/features/auth/pages/login/login.html src/app/features/auth/pages/login/login.css src/app/features/auth/register/register.html src/app/features/auth/register/register.css src/app/features/auth/forgot-password/forgot-password.html src/app/features/auth/forgot-password/forgot-password.css src/app/features/auth/reset-password/reset-password.html src/app/features/auth/reset-password/reset-password.css src/app/features/auth/accept-invitation/accept-invitation.html src/app/features/auth/accept-invitation/accept-invitation.css
 git commit -m "Apply consistent NEXORA branding across frontend"
git push origin main
```
