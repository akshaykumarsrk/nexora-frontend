import { Component, input, output, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NAVIGATION_ITEMS } from '../navigation/navigation.config';


@Component({
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  
  private readonly authService = inject(AuthService);

  get navigationItems() {
    const role = this.authService.getRole();
    if (role === 'TECHNICIAN') {
      return NAVIGATION_ITEMS.filter(item => ['/dashboard', '/notifications', '/ai-assistant'].includes(item.route)).map(item => item.route === '/dashboard' ? { ...item, route: '/technician-dashboard' } : item).concat([{ label: 'My Job Cards', icon: 'pi pi-clipboard', route: '/job-cards' }]);
    }
    if (role === 'STAFF') {
      return NAVIGATION_ITEMS.filter(item => !['/employees', '/technicians', '/settings/branding', '/payments', '/user-access'].includes(item.route));
    }
    if (role === 'MANAGER') {
      return NAVIGATION_ITEMS.filter(item => !['/settings/branding', '/user-access'].includes(item.route));
    }
    return NAVIGATION_ITEMS;
  }

  // This means: “Sidebar receives a value from its parent. That value tells Sidebar whether it is open or closed.”
  readonly open = input(false);
                                            // Shell (Parent)
                                            //  │
                                            //  │ (input) open = true
                                            //  ↓
                                            // Sidebar

  readonly closed = output<void>(); // “Sidebar can notify Shell that it should be closed.”
                                            // Shell
                                            //  │
                                            //  │ (output) closed = true
                                            //  ↓
                                            // Sidebar
}
