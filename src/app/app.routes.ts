import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'history', loadComponent: () => import('./pages/history/history').then((m) => m.History) },
  { path: 'drinks', loadComponent: () => import('./pages/drinks/drinks').then((m) => m.Drinks) },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings) },
];
