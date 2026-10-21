import { NavigationItem } from './navigation-item';

export const NAVIGATION_ITEMS: NavigationItem[] = [

  // =========================================================
  // CORE
  // =========================================================

  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/dashboard'
  },

  {
    label: 'Employees',
    icon: 'pi pi-users',
    route: '/employees'
  },

  {
    label: 'Customers',
    icon: 'pi pi-users',
    route: '/customers'
  },

  {
    label: 'Sites',
    icon: 'pi pi-map-marker',
    route: '/sites'
  },

  {
    label: 'Assets',
    icon: 'pi pi-box',
    route: '/assets'
  },

  {
    label: 'Technicians',
    icon: 'pi pi-user',
    route: '/technicians'
  },


  // =========================================================
  // OPERATIONS
  // =========================================================

  {
    label: 'Service Requests',
    icon: 'pi pi-wrench',
    route: '/service-requests'
  },

  {
    label: 'Jobs',
    icon: 'pi pi-briefcase',
    route: '/jobs'
  },

  {
    label: 'Parts',
    icon: 'pi pi-cog',
    route: '/parts'
  },

  {
    label: 'Inventory',
    icon: 'pi pi-database',
    route: '/inventory'
  },

  {
    label: 'Brands & Models',
    icon: 'pi pi-tags',
    route: '/catalog'
  },


  // =========================================================
  // BILLING & PAYMENTS
  // =========================================================

  {
    label: 'Invoices',
    icon: 'pi pi-file',
    route: '/invoices'
  },

  {
    label: 'Payments',
    icon: 'pi pi-wallet',
    route: '/payments'
  },

  {
    label: 'Subscription',
    icon: 'pi pi-credit-card',
    route: '/subscription'
  },


  // =========================================================
  // SYSTEM
  // =========================================================

  {
    label: 'Organization Branding',
    icon: 'pi pi-palette',
    route: '/settings/branding'
  },

  {
    label: 'AI Technician Assistant',
    icon: 'pi pi-sparkles',
    route: '/ai-assistant'
  },

  {
    label: 'User Access',
    icon: 'pi pi-lock',
    route: '/user-access'
  },

  {
    label: 'Notifications',
    icon: 'pi pi-bell',
    route: '/notifications'
  }

];