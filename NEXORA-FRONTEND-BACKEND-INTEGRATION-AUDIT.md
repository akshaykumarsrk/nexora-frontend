# NEXORA frontend/backend integration audit

## Changes in this pass

- Fixed the Parts page stylesheet root selector: the template used `.parts-page` while the CSS was scoped to `.part-page`, leaving page-level typography, layout, and card styling unapplied.
- Added inventory/parts icons to the page and section headings and corrected singular/plural result text.
- Applied higher-contrast status-tag colors for active/inactive part states in light and dark themes.
- Removed the mock dashboard-summary interceptor from the global HTTP interceptor chain so dashboard cards are sourced from the real backend API rather than a fabricated response.
- Added a Settings hub for appearance, organization branding, notifications, and the AI assistant; `/settings` now opens this hub.
- Added a Brands & Models catalog page wired to the backend's `/api/catalog/brands` and `/api/catalog/equipment-models` endpoints. Create forms are shown only for ADMIN/MANAGER; the backend also enforces these roles.
- Connected the service-request AI summary UI to `GET /api/ai/service-requests/{id}/summary`, in addition to the existing technician assistant `POST /api/ai/technician-assistant` integration.
- Added a topbar help popover with useful workspace shortcuts and updated the breadcrumb to reflect the current route.
- Replaced the hard-coded topbar display name/role with the username and role read from the signed-in JWT payload.
- Set production `environment.apiUrl` to `/api`, intended for a same-origin reverse proxy to the Spring Boot API.

## Backend contract findings from the supplied backend ZIP

- `POST /api/parts` and `PUT /api/parts/{id}` require ADMIN or MANAGER. `GET /api/parts` and `GET /api/parts/{id}` permit ADMIN, MANAGER, and STAFF. Part deletion is ADMIN-only.
- There is no standalone generic Product entity/controller in the supplied backend. The current catalog model consists of Parts plus Brands and Equipment Models. Users can create any parts they need through the existing Parts form, and ADMIN/MANAGER can create brands/models through the new catalog page.
- The backend exposes two distinct AI features: `POST /api/ai/technician-assistant` and `GET /api/ai/service-requests/{id}/summary`. The frontend now has UI entry points for both.
- Organization branding remains wired to the existing organization-branding feature. Password reset and invitation flows already have frontend routes/components in this project.

## Deployment notes

- Configure the deployed web server/reverse proxy to forward `/api/*` to the Spring Boot backend. If the frontend and API are hosted on different origins, configure the production environment URL and backend CORS accordingly.
- PrimeNG 22 displays its PrimeUI license notice when its license is missing/invalid/expired. This package does not attempt to hide or bypass that notice. Configure a valid license appropriate to your use, or decide on a supported component-library/version migration before launch.
- The build/test suite could not be rerun in this environment because `npm ci` did not complete and no Angular CLI executable was available. Run `npm ci`, `npm test`, and `npm run build` locally before deployment.
