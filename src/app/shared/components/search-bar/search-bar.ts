// src/app/shared/components/search-bar/search-bar.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.html',
})
export class SearchBar {
  private router = inject(Router);

  buscar(termino: string) {
    const busquedaLimpiada = termino.trim();

    if (busquedaLimpiada) {
      // Navega a la ruta del catálogo agregando ?q=termino_escrito
      this.router.navigate(['/catalogo'], { queryParams: { q: busquedaLimpiada } });
    }
  }
}
