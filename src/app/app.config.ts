import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { SobrioPreset } from './theme';
import { ThemeService } from './services/theme-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    providePrimeNG({
      theme: {
        preset: SobrioPreset,
        options: { darkModeSelector: '.app-dark' },
      }
    }),
  ]
};
