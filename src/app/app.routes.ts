import { Routes } from '@angular/router';
import { Home } from './shared/components/home/home';
import { DashboardAdmin } from './shared/components/dashboard-admin/dashboard-admin';
export const routes: Routes = [
  { path: 'dashboard-admin', component: DashboardAdmin },
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: Home },
  { path: '**', redirectTo: 'home' },
];
