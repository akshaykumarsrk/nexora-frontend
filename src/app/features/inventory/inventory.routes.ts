import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [

  // /inventory
  {
    path: '',
    loadComponent: () =>
      import(
        './pages/inventory-list/inventory-list'
      ).then(m => m.InventoryList)
  },

  // /inventory/create
  {
    path: 'create',
    loadComponent: () =>
      import(
        './pages/inventory-form/inventory-form'
      ).then(m => m.InventoryForm)
  },

  // /inventory/:id/edit
  {
    path: ':id/edit',
    loadComponent: () =>
      import(
        './pages/inventory-form/inventory-form'
      ).then(m => m.InventoryForm)
  },

  // /inventory/:id
  {
    path: ':id',
    loadComponent: () =>
      import(
        './pages/inventory-details/inventory-details'
      ).then(m => m.InventoryDetails)
  }

];