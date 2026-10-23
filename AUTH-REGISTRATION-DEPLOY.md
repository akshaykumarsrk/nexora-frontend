# NEXORA authentication frontend update

This update adds a public registration page and fixes the email verification page's handling of HTML responses.

## Changes

- Added `/register` page with organization name, username, email, password, and confirm-password fields.
- Connects registration to `POST ${environment.apiUrl}/auth/register` using the existing production API base URL.
- Added a Create an account link on the login page.
- Email verification refuses to display a returned HTML document as a success message.
- Production environment API base is `https://nexora-backend-fna7.onrender.com/api`.

## Apply and deploy

1. Extract this ZIP and copy its project files over your current frontend working tree, preserving any unrelated local changes.
2. Confirm `src/environments/environment.ts` still points to the Render backend URL above.
3. Use a Node version supported by this Angular workspace. Angular 22.1.6 declares Node `^22.22.3 || ^24.15.0 || >=26.0.0`.
4. Run:

```bash
npm ci
npm run build
```

5. If the build succeeds, commit and push:

```bash
git status
git add src/app/app.routes.ts src/app/features/auth/pages/login/login.html src/app/features/auth/pages/login/login.css src/app/features/auth/verify-email/verify-email.ts src/app/features/auth/register/register.ts src/app/features/auth/register/register.html src/app/features/auth/register/register.css src/environments/environment.ts
git commit -m "Add registration page and fix auth frontend routing"
git push origin main
```

If your Vercel deployment branch is not `main`, push to the configured branch instead.

## Smoke tests after deployment

- Open `/register`; submit valid details and verify the API request goes to `https://nexora-backend-fna7.onrender.com/api/auth/register`.
- Confirm registration responds with a message asking the user to verify their email.
- Click the verification link. The page should display the plain-text success message, not HTML source.
- Confirm the user's `email_verified` value becomes true in the database.
- Submit login and verify the browser request goes to `https://nexora-backend-fna7.onrender.com/api/auth/login`, not the Vercel domain.
