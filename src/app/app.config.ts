import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

import Aura from '@primeuix/themes/aura'; // means: Get the Aura design theme.
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor])),
    
    // Required by PrimeNG Toast
    // Why do we use MessageService?
    // MessageService is responsible for sending messages to the Toast component.
    MessageService,

  // We want PrimeNG to follow our design language. That's why we configured: We'll customize that later.
  // means: "PrimeNG, use Aura as the default theme for your components."
  // remove "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  // remove "node_modules/primeng/resources/primeng.min.css", from angular.json from angular.json
  // Why? Because you're using the new PrimeNG theme system. You no longer manually load:
  // Your theme is being configured here instead:
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
