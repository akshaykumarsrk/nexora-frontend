import {
  Routes
} from '@angular/router';

export const SERVICE_REQUEST_ROUTES: Routes = [

  // List
  {
    path: '',
    loadComponent: () =>
      import(
        './pages/service-request-list/service-request-list'
      ).then(
        m => m.ServiceRequestList
      )
  },

  // Create
  {
    path: 'new',
    loadComponent: () =>
      import(
        './pages/service-request-form/service-request-form'
      ).then(
        m => m.ServiceRequestForm
      )
  },

  // Edit
  {
    path: ':id/edit',
    loadComponent: () =>
      import(
        './pages/service-request-form/service-request-form'
      ).then(
        m => m.ServiceRequestForm
      )
  },

  // Details
  {
    path: ':id',
    loadComponent: () =>
      import(
        './pages/service-request-details/service-request-details'
      ).then(
        m => m.ServiceRequestDetails
      )
  }

];