import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductCard } from './components/product-card/product-card';
import { ProductSkeleton } from './components/product-skeleton/product-skeleton';
import { EmptyState } from './components/empty-state/empty-state';
import { ArticuloService } from '../../core/services/articulo.service';
import { Articulo } from '../../core/models/articulo';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductCard, ProductSkeleton, EmptyState],
  templateUrl: './shop.html',
})
export class Shop {
  private articuloService = inject(ArticuloService);

  // Estados reactivos usando Signals
  articulos = signal<Articulo[]>([]);
  isLoading = signal<boolean>(true);

  terminoBusqueda = signal<string | null>('Warhammer'); // Simulado

  // Mock de filtros para maquetar
  filtros = {
    franquicias: ['Genshin Impact', 'Warhammer 40k', 'The Legend of Zelda'],
    materiales: ['Resina', 'PLA', 'PETG'],
    tamanos: ['Escala 1/7', 'Escala 1/8', '10cm x 10cm'],
  };

  ngOnInit(): void {
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.isLoading.set(true);
    this.articuloService.getArticulos().subscribe({
      next: (data) => {
        this.articulos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al obtener los artículos:', err);
        this.isLoading.set(false);
      },
    });
  }
}
