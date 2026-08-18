import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminProfileComponent } from './admin-profile.component';
import { AdminArticlesComponent } from './admin-articles.component';
import { AdminOrdersComponent } from './admin-orders.component';
import { AdminUsersComponent } from './admin-users.component';
import { AdminAttributes } from '../admin-attributes/admin-attributes';
import { AdminHomeComponent } from './admin-home.component';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AdminProfileComponent,
    AdminArticlesComponent,
    AdminOrdersComponent,
    AdminUsersComponent,
    AdminAttributes,
    AdminHomeComponent
  ],
})
export class DashboardAdmin {
  activeTab: string = 'articles';
  authService = inject(AuthService);
  router = inject(Router);

  setTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}

