import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticuloService } from '../../core/services/articulo.service';
import { ArticuloDetalle } from '../../core/models/articulo-detalle';

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
  articulo = signal<ArticuloDetalle | null>(null);
  isLoading = signal<boolean>(true);
  cantidad = signal<number>(1);

  // Convertimos el objeto JSONB de atributos en un arreglo para iterarlo fácilmente en el HTML
  listaAtributos = computed(() => {
    const data = this.articulo()?.attributes;
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
    const isPoD = this.articulo()?.isPrintOnDemand;
    const stockMaximo = isPoD ? 99 : (this.articulo()?.stock || 1);

    // Evitamos que baje de 1 o suba más allá del stock disponible
    if (nuevaCantidad >= 1 && nuevaCantidad <= stockMaximo) {
      this.cantidad.set(nuevaCantidad);
    }
  }

  cotizarPorWhatsApp(prod: ArticuloDetalle) {
    const numeroTelefono = '521234567890';
    let mensaje = '';
    
    if (prod.requiresQuote) {
      mensaje = `Hola, me gustaría cotizar la impresión 3D de la figura "${prod.name}". ¿Me podrían dar precios y tiempos de entrega? (Enlace: ${window.location.href})`;
    } else {
      mensaje = `Hola, me interesa comprar el artículo "${prod.name}" (Cantidad: ${this.cantidad()}) que cuesta $${prod.price}. ¿Tienen disponibilidad? (Enlace: ${window.location.href})`;
    }

    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
    window.open(url, '_blank');
  }
}
