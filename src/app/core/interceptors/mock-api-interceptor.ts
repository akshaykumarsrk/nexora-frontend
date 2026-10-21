import { 
  HttpInterceptorFn, 
  HttpResponse
 } from '@angular/common/http';

import { of } from 'rxjs';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  
  if(req.method === 'GET' && req.url.endsWith('/dashboard/summary')) {

    return of(
      new HttpResponse({
        status: 200,
          body: {
          revenue: 1240000,
          employees: 248,
          activateProjects: 36,
          pendingTasks: 142
        }
      })
    );
  }

  return next(req);

};
