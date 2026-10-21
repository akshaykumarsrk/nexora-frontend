# NEXORA Technician Portal Update

## Changes
- Added `GET /api/dashboard/technician`, restricted to `ROLE_TECHNICIAN`.
- The endpoint scopes jobs to the authenticated username and organization; it returns assigned jobs, statuses, customer/site, schedule, completed count, and invoice value associated with completed assigned jobs.
- Added a dedicated Angular technician dashboard and redirect from `/dashboard` for TECHNICIAN accounts.
- Sidebar navigation is reduced for technician accounts so they do not see organization-wide admin modules.
- When an admin creates a technician profile, the backend first attempts to link an existing TECHNICIAN login with the same email and organization (if it is not already linked elsewhere). Otherwise, the frontend sends an account invitation using that email as the login username. The user account is created and linked when the invitation is accepted.

## Important accounting distinction
The backend does not currently model technician salary, commission, or personal earnings. The dashboard therefore labels the monetary metric **Completed-job billed value** (invoice total for completed jobs assigned to that technician), not personal income. If NEXORA needs actual technician earnings, add an explicit commission/payroll model rather than treating invoice revenue as wages.

## Manual verification before deployment
1. Start the backend and frontend; create a technician with a valid email from the Admin portal.
2. If a TECHNICIAN login with the same email already exists in the same organization, confirm it is linked to the profile. Otherwise, confirm an invitation email arrives; accept it and set the password.
3. Sign in using the email address as username and the new password when using the invitation flow.
4. Confirm the user lands on `/technician-dashboard` and only sees jobs assigned to their linked technician profile.
5. Assign a job to that technician and confirm it appears; complete it and create its invoice to verify the completed-job billed value.
6. Confirm non-technician dashboards still use `/api/dashboard`.

The source packages are updated, but a build/test run could not be executed in this environment because Maven and the frontend dependencies are not installed here. Run the project's standard backend test/build and `npm test` / `npm run build` locally before deployment.
