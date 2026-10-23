import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

import { API_CONFIG } from "../config/api";
import { Observable, tap } from "rxjs";

export interface LoginRequest {
    username: string,
    password: string
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'TECHNICIAN' | 'USER';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = `${API_CONFIG.baseUrl}/auth`;

    login(credentials: LoginRequest): Observable<string> {

        // Why responseType: 'text'?
        // Your current backend returns: id="6xq7p1" return ResponseEntity.ok(token);
        // So Angular receives a plain text JWT, not JSON.
        // Without: responseType: 'text': Angular expects JSON and can produce a parsing error.
        return this.http.post(`${this.apiUrl}/login`, credentials, {
            responseType: 'text'
        })
        // Why tap()?
        // tap() lets us perform a side effect without changing the API response.
        .pipe(
            tap(token => {
                localStorage.setItem('accessToken', token);
            })
        );
    }

    /** Sends a non-enumerating password-reset request to the backend. */
    requestPasswordReset(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, {
            email: email.trim()
        });
    }

    /** Completes a password reset using the one-time token sent by email. */
    resetPassword(token: string, password: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
            token,
            password
        });
    }

    /** Changes the signed-in user's password through the authenticated backend endpoint. */
    changeOwnPassword(request: { currentPassword: string; newPassword: string }): Observable<void> {
        return this.http.patch<void>(`${API_CONFIG.baseUrl}/users/me/password`, request);
    }

    logout(): void {
        localStorage.removeItem('accessToken');
    }

    getToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    isLoggedIn(): boolean {
        return this.getToken() !== null;
    }

    getUsername(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            if (!payload) return null;
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
            const decoded = JSON.parse(atob(padded));
            return typeof decoded.sub === 'string' && decoded.sub.trim() ? decoded.sub.trim() : null;
        } catch {
            return null;
        }
    }

    getRole(): UserRole | null {

        const token = this.getToken();

        if(!token) {
            return null;
        }

        try {

            // JWT has 3 parts
            // A JWT looks like: HEADER.PAYLOAD.SIGNATURE
            // For example xxxxx.yyyyy.zzzzz
            // The middle section is the intresting one:
            // HEADER
            // .
            // PAYLOAD   ← role is here
            // .
            // SIGNATURE
            // That's why you have:
            // const payload = token.split('.')[1];
            // split('.') breaks the JWT:
            // [
            // "HEADER",
            // "PAYLOAD",
            // "SIGNATURE"
            // ]
            // And [1] means: Give me PAYLOAD

            const payload = token.split('.')[1];

            if(!payload) {
                return null;
            }

            // Jwt uses Base64URL instead of normal Base64.
            // Convert it into a format that atob() can decode.
            // So we're converting:
            // Base64URL
            // ↓
            // Base64
            // This converts the JWT payload into a format that JavaScript can decode.
            const base64 = payload
            .replace(/-/g, '+')
            .replace(/_/g, '/');

            // Add missing Base64 padding.
            const paddedBase64 =
                base64.padEnd(
                base64.length + (4 - base64.length % 4) % 4,
                '='
                );

            // decodes Base64 text.
            // So something like: eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9
            // becomes: 
            // {
            //   "sub": "admin",
            //   "role": "ADMIN"
            // }
            // atob() gives us text.
            // JSON.parse() turns that text into a JavaScript object.
            const decodedPayload = JSON.parse(
                atob(paddedBase64)
            );

            // Get the role
            const role = decodedPayload.role;

            if (typeof role !== 'string') {
                return null;
            }

            // This is actually a good idea.
            // Because Spring Security may give us: ROLE_ADMIN
            // while our Angular application wants: ADMIN
            // ROLE_ADMIN
            //     ↓
            // remove ROLE_
            //     ↓
            // ADMIN
            const normalizedRole =
                role.replace('ROLE_', '').toUpperCase();

            const supportedRoles: readonly UserRole[] = [
                'ADMIN',
                'MANAGER',
                'STAFF',
                'TECHNICIAN',
                'USER',
            ];

            if (supportedRoles.includes(normalizedRole as UserRole)) {
                return normalizedRole as UserRole;
            }

            return null;

        } catch(error) {

            console.error('Unable to read JWT role:', error);

            return null;

        }

    }

    hasRole(role: UserRole): boolean {
        return this.getRole() === role;
    }

    isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }
}
