import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'shop', loadComponent: () => import('./features/shop/shop').then(m => m.Shop) },
  { path: 'producto/:id', loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetail) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'dashboard-admin', loadComponent: () => import('./features/admin/dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin) },
  { path: '**', redirectTo: 'home' },
];
