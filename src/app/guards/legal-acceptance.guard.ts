import { inject, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const legalAcceptanceGuard: CanActivateFn = async () => {
  const injector = inject(Injector);
  const welcome = inject(Router).createUrlTree(['/welcome']);

  try {
    // Dynamic import keeps Dexie out of the initial bundle
    const { PreferencesService } = await import('../services/preferences-service');
    return (await injector.get(PreferencesService).hasAcceptedLegalTerms()) || welcome;
  } catch {
    return welcome;
  }
};
