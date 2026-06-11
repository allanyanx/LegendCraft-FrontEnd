import { Routes } from '@angular/router';
import { Home } from './shared/components/home/home';
import { Shop } from './features/shop/shop';

import { DashboardAdmin } from './shared/components/dashboard-admin/dashboard-admin';
import { ProductDetail } from './features/product-detail/product-detail';
export const routes: Routes = [
  { path: 'dashboard-admin', component: DashboardAdmin },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'shop', component: Shop },
  { path: 'producto/:id', component: ProductDetail },
  { path: 'home', component: Home },
  { path: '**', redirectTo: 'home' },
];
