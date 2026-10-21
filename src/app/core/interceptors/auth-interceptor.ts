import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';


// HTTP interceptor: Protects/augments API requests by attaching the JWT.
// Its job is: "When Angular calls the backend, attach the authentication token."
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

    const isPublicVerificationRequest = req.url.includes('/api/auth/verify-email');

  const token = authService.getToken();

  let authReq = req;

  // Why req.clone()?
  // Angular HTTP requests are immutable.
  // So we cannot do: req.headers = ...
  // instead we do clone
  // means: "Create a new copy of this request with the Authorization header added."
  // Attach JWT only when available; public verification does not need it.
  if(token && !isPublicVerificationRequest) {

    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(

    catchError((error: HttpErrorResponse) => {

      // A 401 means: "You are not authenticated / your authentication is invalid."
      // A 403 means: "You are authenticated, but you don't have permission."
      if(error.status === 401 && !isPublicVerificationRequest) {

        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};

// Your Original request:
// GET /api/employees
// becomes:
// GET /api/employees
// Authorization: Bearer eyJhbGciOi...
// because the interceptor sits between Angular and your backend:
// EmployeeService
//       ↓
// HttpClient
//       ↓
// AuthInterceptor
//       ↓
// Add JWT
//       ↓
// Spring Boot
//       ↓
// JwtAuthenticationFilter

// Now it becomes
//                 NEXORA AUTH
//                     │
//       ┌─────────────┼─────────────┐
//       ↓             ↓             ↓
//     Login         Guard       Interceptor
//       │             │             │
//       ↓             ↓             ↓
//  Get JWT       Protect UI     Attach JWT
//       │                           │
//       └─────────────┬─────────────┘
//                     ↓
//               Spring Security
//                     ↓
//                JWT Filter
//                     ↓
//                API access