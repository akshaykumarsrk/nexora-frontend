# NEXORA frontend update changelog

## Parts page
- Fixed a root CSS selector mismatch that caused styling not to apply to the Parts page.
- Added visual icons for Parts and All Parts headings.
- Corrected “1 parts found” to use singular/plural grammar.
- Improved active/inactive tag contrast for light and dark themes.
- Restricted the Add Part button to ADMIN/MANAGER roles in the UI; backend authorization remains authoritative.

## Settings and catalog
- `/settings` now opens a settings hub with theme switching, organization branding, notifications, and AI assistant shortcuts.
- Added `/catalog` for managing brands and equipment models through the existing backend API. Creation forms are limited to ADMIN/MANAGER users.

## AI and dashboard
- Added service-request AI summaries to service-request details, using the backend summary endpoint.
- Retained the AI technician assistant endpoint and documented both supported AI operations.
- Removed the global mock dashboard interceptor so dashboard data comes from the real backend endpoint.

## App shell
- Added topbar help shortcuts and dynamic route breadcrumb text.
- Displayed the signed-in username/role from the JWT rather than hard-coded “Akshay / ADMIN”.
- Changed the production API base URL to `/api` for a same-origin reverse-proxy deployment.

See `NEXORA-FRONTEND-BACKEND-INTEGRATION-AUDIT.md` for backend endpoint/role findings and deployment caveats.
