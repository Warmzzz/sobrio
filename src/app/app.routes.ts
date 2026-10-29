import { Routes } from '@angular/router';
import { legalAcceptanceGuard } from './guards/legal-acceptance.guard';

export const routes: Routes = [
  { path: 'welcome', loadComponent: () => import('./pages/welcome/welcome').then((m) => m.Welcome) },
  { path: 'legal', loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal) },
  {
    path: '',
    canActivateChild: [legalAcceptanceGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      { path: 'history', loadComponent: () => import('./pages/history/history').then((m) => m.History) },
      { path: 'drinks', loadComponent: () => import('./pages/drinks/drinks').then((m) => m.Drinks) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings) },
    ],
  },
  { path: '**', redirectTo: '' },
];
