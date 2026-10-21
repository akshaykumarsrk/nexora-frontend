import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Frontend navigation guard. This improves the experience and hides routes that
 * do not belong to a role; Spring Security remains the authoritative API guard.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const role = authService.getRole();
  const url = state.url.split('?')[0].split('#')[0];
  const starts = (path: string) => url === path || url.startsWith(`${path}/`);

  if (role === 'TECHNICIAN') {
    if (url === '/dashboard' || url === '/') {
      return router.createUrlTree(['/technician-dashboard']);
    }
    const allowed = ['/technician-dashboard', '/ai-assistant', '/notifications', '/job-cards', '/settings'];
    if (!allowed.some(starts) || starts('/settings/branding') || starts('/settings/ai-prompt')) {
      return router.createUrlTree(['/technician-dashboard']);
    }
  }

  if (role === 'STAFF') {
    const denied = ['/employees', '/technicians', '/payments', '/settings/branding', '/settings/ai-prompt', '/user-access'];
    if (denied.some(starts)) return router.createUrlTree(['/dashboard']);
  }

  if (role === 'MANAGER' && (starts('/settings/branding') || starts('/user-access'))) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
