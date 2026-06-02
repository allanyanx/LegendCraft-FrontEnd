import { Component, inject } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { CartWidget } from '../cart-widget/cart-widget';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

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
    console.log('Redirigiendo provisionalmente al dashboard...');
    this.router.navigate(['/dashboard-admin']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
