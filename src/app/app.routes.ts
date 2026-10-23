import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell/shell';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard';
import { TechnicianDashboardComponent } from './features/technician-portal/technician-dashboard';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './core/guards/auth-guard';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./features/public-home/public-home').then(m => m.PublicHome) },
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/public-home/public-home').then(m => m.PublicHome) },

  // =========================================================
  // APPLICATION SHELL
  // =========================================================

  {
    path: '',
    component: ShellComponent,

    children: [

      // =====================================================
      // DEFAULT
      // =====================================================

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // =====================================================
      // DASHBOARD
      // =====================================================

      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
      },

      {
        path: 'technician-dashboard',
        component: TechnicianDashboardComponent,
        canActivate: [authGuard]
      },

      // =====================================================
      // EMPLOYEES
      // =====================================================

      {
        path: 'employees',
        loadComponent: () =>
          import(
            './features/employees/pages/employees/employees'
          ).then(m => m.Employees),

        canActivate: [authGuard]
      },

      // =====================================================
      // JOBS
      // =====================================================

      {
        path: 'jobs',
        canActivate: [authGuard],

        children: [

          // /jobs
          {
            path: '',
            loadComponent: () =>
              import(
                './features/jobs/job-list/job-list'
              ).then(m => m.JobList)
          },

          // /jobs/create
          {
            path: 'create',
            loadComponent: () =>
              import(
                './features/jobs/job-form/job-form'
              ).then(m => m.JobForm)
          },

          // /jobs/:id/edit
          {
            path: ':id/edit',
            loadComponent: () =>
              import(
                './features/jobs/job-form/job-form'
              ).then(m => m.JobForm)
          },

          // /jobs/:id
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/jobs/job-details/job-details'
              ).then(m => m.JobDetails)
          }

        ]
      },

      // =====================================================
      // SERVICE REQUESTS
      // =====================================================

      {
        path: 'service-requests',
        canActivate: [authGuard],

        loadChildren: () =>
          import(
            './features/service-requests/service-request.routes'
          ).then(m => m.SERVICE_REQUEST_ROUTES)
      },

      // =====================================================
      // JOB CARDS
      // =====================================================

      {
        path: 'job-cards',
        canActivate: [authGuard],

        children: [

          // /job-cards
          {
            path: '',
            loadComponent: () =>
              import(
                './features/job-cards/components/job-card-list/job-card-list'
              ).then(m => m.JobCardList)
          },

          // /job-cards/new?jobId=1
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/job-cards/components/job-card-form/job-card-form'
              ).then(m => m.JobCardForm)
          },

          // /job-cards/:id/edit
          {
            path: ':id/edit',
            loadComponent: () =>
              import(
                './features/job-cards/components/job-card-form/job-card-form'
              ).then(m => m.JobCardForm)
          },

          // /job-cards/:id
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/job-cards/components/job-card-details/job-card-details'
              ).then(m => m.JobCardDetails)
          }

        ]
      },

      // =====================================================
      // INVOICES
      // =====================================================

      {
        path: 'invoices',

        canActivate: [authGuard],

        children: [

          // /invoices
          {
            path: '',
            loadComponent: () =>
              import(
                './features/invoices/pages/invoice-list/invoice-list'
              ).then(m => m.InvoiceList)
          },

          // /invoices/create
          {
            path: 'create',
            loadComponent: () =>
              import(
                './features/invoices/pages/invoice-form/invoice-create'
              )
                .then(m => m.InvoiceCreate)
          },

          // /invoices/:id
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/invoices/pages/invoice-details/invoice-details'
              ).then(m => m.InvoiceDetails)
          }

        ]
      },

      // =====================================================
      // PAYMENTS
      // =====================================================

      {
        path: 'payments',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/payment/pages/payment-list/payment-list'
          ).then(
            m => m.PaymentList
          )
      },

      // =====================================================
      // TECHNICIANS
      // =====================================================

      {
        path: 'technicians',
        canActivate: [authGuard],

        children: [

          // /technicians
          {
            path: '',
            loadComponent: () =>
              import(
                './features/technicians/pages/technician-list/technician-list'
              ).then(m => m.TechnicianList)
          },

          // /technicians/new
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/technicians/pages/technician-form/technician-form'
              ).then(m => m.TechnicianForm)
          },

          // /technicians/:id/edit
          {
            path: ':id/edit',
            loadComponent: () =>
              import(
                './features/technicians/pages/technician-form/technician-form'
              ).then(m => m.TechnicianForm)
          },

          // /technicians/:id
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/technicians/pages/technician-details/technician-details'
              ).then(m => m.TechnicianDetails)
          }

        ]
      },

      // =====================================================
      // PARTS
      // =====================================================

      {
        path: 'parts',
        canActivate: [authGuard],

        children: [

          // /parts
          {
            path: '',
            loadComponent: () =>
              import(
                './features/parts/pages/part-list/part-list'
              ).then(m => m.PartList)
          },

          // /parts/create
          {
            path: 'create',
            loadComponent: () =>
              import(
                './features/parts/pages/part-form/part-form'
              ).then(m => m.PartForm)
          },

          // /parts/:id/edit
          {
            path: ':id/edit',
            loadComponent: () =>
              import(
                './features/parts/pages/part-form/part-form'
              ).then(m => m.PartForm)
          },

          // /parts/:id
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/parts/pages/part-details/part-details'
              ).then(m => m.PartDetails)
          }

        ]
      },

      // =====================================================
      // INVENTORY
      // =====================================================

      {
        path: 'inventory',
        canActivate: [authGuard],

        loadChildren: () =>
          import(
            './features/inventory/inventory.routes'
          ).then(m => m.INVENTORY_ROUTES)
      },

      // =====================================================
      // CUSTOMERS
      // =====================================================

      {
        path: 'customers',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/customers/pages/customer-list/customer-list')
                .then(m => m.CustomerList)
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/customers/pages/customer-form/customer-form')
                .then(m => m.CustomerForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/customers/pages/customer-form/customer-form')
                .then(m => m.CustomerForm)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/customers/pages/customer-details/customer-details')
                .then(m => m.CustomerDetails)
          }
        ]
      },

      // =====================================================
      // SITES
      // =====================================================

      {
        path: 'sites',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/sites/pages/site-list/site-list')
                .then(m => m.SiteList)
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/sites/pages/site-form/site-form')
                .then(m => m.SiteForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/sites/pages/site-form/site-form')
                .then(m => m.SiteForm)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/sites/pages/site-details/site-details')
                .then(m => m.SiteDetails)
          }
        ]
      },

      // =====================================================
      // ASSETS
      // =====================================================

      {
        path: 'assets',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/assets/pages/asset-list/asset-list')
                .then(m => m.AssetList)
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/assets/pages/asset-form/asset-form')
                .then(m => m.AssetForm)
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/assets/pages/asset-form/asset-form')
                .then(m => m.AssetForm)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/assets/pages/asset-details/asset-details')
                .then(m => m.AssetDetails)
          }
        ]
      },

      // =====================================================
      // PRODUCT CATALOG (brands and equipment models)
      // =====================================================
      { path: 'catalog', canActivate: [authGuard], loadComponent: () => import('./features/catalog/catalog-page').then(m => m.CatalogPage) },

      // =====================================================
      // NOTIFICATIONS
      // =====================================================
      {
        path: 'notifications',
        canActivate: [authGuard],
        loadComponent: () => import('./features/notifications/notifications-page').then(m => m.NotificationsPage)
      },

      // Keep the Settings navigation entry useful; branding is the current settings area.
      { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile-page').then(m => m.ProfilePage) },
      { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./features/settings/settings-home/settings-home').then(m => m.SettingsHome) },
      { path: 'subscription', canActivate: [authGuard], loadComponent: () => import('./features/subscriptions/subscription-page').then(m => m.SubscriptionPage) },
      { path: 'user-access', canActivate: [authGuard], loadComponent: () => import('./features/user-access/user-access').then(m => m.UserAccess) },
      { path: 'settings/ai-prompt', canActivate: [authGuard], loadComponent: () => import('./features/settings/ai-prompt-settings/ai-prompt-settings').then(m => m.AiPromptSettings) },

      // =====================================================
      // AI TECHNICIAN ASSISTANT
      // =====================================================
      {
        path: 'ai-assistant',
        canActivate: [authGuard],
        loadComponent: () => import('./features/ai-assistant/ai-assistant-page').then(m => m.AiAssistantPage)
      },

      // =====================================================
      // ORGANIZATION BRANDING SETTINGS
      // =====================================================

      {
        path: 'settings/branding',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/settings/organization-branding/organization-branding')
            .then(m => m.OrganizationBrandingComponent)
      },

      // =====================================================
      // STOCK MOVEMENTS
      // =====================================================

      {
        path: 'stock-movements',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/inventory/pages/stock-movements/stock-movements')
            .then(m => m.StockMovements)
      },


      // Add to the existing routes array:
      {
        path: 'accept-invitation',
        component: AcceptInvitationComponent
      },


    ]
  },

  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email')
        .then(m => m.VerifyEmail)
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.Register)
  },

  // =========================================================
  // LOGIN
  // =========================================================

  {
    path: 'login',
    component: Login
  },

  // =========================================================
  // FALLBACK
  // =========================================================

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];