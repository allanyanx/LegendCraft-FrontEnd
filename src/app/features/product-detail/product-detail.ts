import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticuloService } from '../../core/services/articulo.service';
import { Articulo } from '../../core/models/articulo';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articuloService = inject(ArticuloService);

  // Estados Reactivos
  articulo = signal<Articulo | null>(null);
  isLoading = signal<boolean>(true);
  cantidad = signal<number>(1);

  // Convertimos el objeto JSONB de atributos en un arreglo para iterarlo fácilmente en el HTML
  listaAtributos = computed(() => {
    const data = this.articulo()?.atributos;
    if (!data) return [];
    return Object.entries(data); // Convierte { franquicia: 'Halo' } en [['franquicia', 'Halo']]
  });

  ngOnInit(): void {
    // Leemos el ID de la URL
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.cargarProducto(Number(idParam));
    } else {
      this.router.navigate(['/catalogo']);
    }
  }

  cargarProducto(id: number) {
    this.isLoading.set(true);
    this.articuloService.getArticuloById(id).subscribe({
      next: (data) => {
        this.articulo.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Si el usuario escribe un ID que no existe, lo regresamos al catálogo
        this.router.navigate(['/catalogo']);
      },
    });
  }

  cambiarCantidad(delta: number) {
    const nuevaCantidad = this.cantidad() + delta;
    const stockMaximo = this.articulo()?.stock || 1;

    // Evitamos que baje de 1 o suba más allá del stock disponible
    if (nuevaCantidad >= 1 && nuevaCantidad <= stockMaximo) {
      this.cantidad.set(nuevaCantidad);
    }
  }
}
