import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { afterEach, describe, expect, it, beforeEach } from 'vitest';
import { AuthService } from './auth';

function ensureLocalStorage(): void {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, String(value)),
        removeItem: (key: string) => store.delete(key),
        clear: () => store.clear(),
      },
    });
  }
}

describe('AuthService', () => {
  let service: AuthService;

  const tokenWithRole = (role: string): string => {
    const payload = btoa(JSON.stringify({ sub: 'test-user', role }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `header.${payload}.signature`;
  };

  beforeEach(() => {
    ensureLocalStorage();
    localStorage.removeItem('accessToken');
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    ensureLocalStorage();
    localStorage.removeItem('accessToken');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns null when no access token exists', () => {
    expect(service.getRole()).toBeNull();
  });

  it('normalizes a ROLE_ADMIN claim', () => {
    localStorage.setItem('accessToken', tokenWithRole('ROLE_ADMIN'));
    expect(service.getRole()).toBe('ADMIN');
    expect(service.isAdmin()).toBe(true);
  });

  it.each(['MANAGER', 'STAFF', 'TECHNICIAN', 'USER'] as const)(
    'recognizes the %s role', (role) => {
      localStorage.setItem('accessToken', tokenWithRole(role));
      expect(service.getRole()).toBe(role);
      expect(service.hasRole(role)).toBe(true);
    },
  );

  it('returns null for an unsupported role', () => {
    localStorage.setItem('accessToken', tokenWithRole('SUPERUSER'));
    expect(service.getRole()).toBeNull();
  });

  it('returns null for a malformed token', () => {
    localStorage.setItem('accessToken', 'not-a-jwt');
    expect(service.getRole()).toBeNull();
  });

  it('clears the token on logout', () => {
    localStorage.setItem('accessToken', tokenWithRole('ADMIN'));
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
