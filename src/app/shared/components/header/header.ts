import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { CartWidget } from '../cart-widget/cart-widget';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { AttributeService } from '../../../core/services/attribute.service';
import { AtributoTipo } from '../../../core/models/atributo-tipo';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBar, CartWidget, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isSidebarOpen = false;
  isMobileCategoriesOpen = false;
  isShopRoute = false; // Variable reactiva para la barra de búsqueda
  private router = inject(Router);
  authService = inject(AuthService);
  private atributoService = inject(AttributeService);

  atributosDisponibles = signal<AtributoTipo[]>([]);

  categoriaFiltro = computed(() => {
    return this.atributosDisponibles().find(a => 
      a.name.toLowerCase() === 'categoría' || 
      a.name.toLowerCase() === 'categoria'
    );
  });

  constructor() {
    this.validarRutaTienda(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.validarRutaTienda(event.urlAfterRedirects);
      });
  }

  ngOnInit() {
    this.atributoService.getAllAttributes().subscribe({
      next: (attrs: any) => this.atributosDisponibles.set(attrs)
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

  toggleMobileCategories() {
    this.isMobileCategoriesOpen = !this.isMobileCategoriesOpen;
  }

  navigateToFilter(valorId: number) {
    this.isSidebarOpen = false;
    this.router.navigate(['/shop'], { queryParams: { attr: valorId } });
  }
}
