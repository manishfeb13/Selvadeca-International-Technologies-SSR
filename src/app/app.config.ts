import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ApiService } from './services/api/api.service';

// Factory function to call ApiService.init() APP_INITIALIZER code to execute (mainly for transferState key-values in SSR) before app is even bootstrapped. Also, sevice is created even if there is no DI of that service in the requested component during SSR. 
function initializeApp(): void | Promise<unknown> {
  const apiService = inject(ApiService);
  return apiService.init(); // returning the apiService method to the provideAppInitializer(initializeApp) below.
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),

    provideAppInitializer(initializeApp) // APP_INITIALIZER
  ]
};
