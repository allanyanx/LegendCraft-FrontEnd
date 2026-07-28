import { Component, inject } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { CartWidget } from '../cart-widget/cart-widget';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBar, CartWidget, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isSidebarOpen = false;
  isShopRoute = false; // Variable reactiva para la barra de búsqueda
  private router = inject(Router);
  authService = inject(AuthService);

  constructor() {
    this.validarRutaTienda(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.validarRutaTienda(event.urlAfterRedirects);
      });
  }

  private validarRutaTienda(url: string) {
    this.isShopRoute = url.includes('/catalogo') || url.includes('/shop');
  }

  login() {
    this.router.navigate(['/auth/login']);
  }
  
  perfil() {
    const user = this.authService.currentUser();
    if (user && user.roles && user.roles.includes('Admin')) {
      this.router.navigate(['/dashboard-admin']);
    } else {
      this.router.navigate(['/dashboard-user']);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
