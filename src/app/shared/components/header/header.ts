import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { SearchBar } from '../search-bar/search-bar';
import { CartWidget } from '../cart-widget/cart-widget';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',

  standalone: true,
  imports: [SearchBar, CartWidget, CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isSidebarOpen = false;
  private router = inject(Router);
  login() {
    console.log('Redirigiendo provisionalmente al dashboard...');
    this.router.navigate(['/dashboard-admin']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
