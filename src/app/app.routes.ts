import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'shop', loadComponent: () => import('./features/shop/shop').then(m => m.Shop) },
  { path: 'producto/:id', loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetail) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart').then(m => m.Cart) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout) },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'dashboard-user', loadComponent: () => import('./features/user/dashboard-user/dashboard-user').then(m => m.DashboardUser), canActivate: [authGuard] },
  { path: 'dashboard-admin', loadComponent: () => import('./features/admin/dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin), canActivate: [adminGuard] },
  { path: '**', redirectTo: 'home' },
];
