import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { ArticuloDetalle } from '../../core/models/articulo-detalle';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articuloService = inject(ArticleService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  // Estados Reactivos
  articulo = signal<ArticuloDetalle | null>(null);
  isLoading = signal<boolean>(true);
  cantidad = signal<number>(1);
  selectedImage = signal<string>('');
  
  zoomTransform = signal<string>('scale(1)');
  zoomOrigin = signal<string>('center center');

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
    this.articuloService.getArticleById(id).subscribe({
      next: (data: any) => {
        this.articulo.set(data);
        if (data.images && data.images.length > 0) {
          const mainImg = data.images.find((i: any) => i.isMain) || data.images[0];
          this.selectedImage.set(this.getImageUrl(mainImg.imageUrl));
        }
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

  onMouseMove(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.zoomOrigin.set(`${x}% ${y}%`);
    this.zoomTransform.set('scale(2)');
  }

  onMouseLeave() {
    this.zoomTransform.set('scale(1)');
    this.zoomOrigin.set('center center');
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

  agregarAlCarrito(prod: ArticuloDetalle) {
    this.cartService.addItem(prod.id, this.cantidad()).subscribe({
      next: () => {
        this.toastService.success('Producto agregado al carrito con éxito');
      },
      error: (err) => {
        this.toastService.error('Ocurrió un error al agregar el producto al carrito');
        console.error(err);
      }
    });
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('/') ? environment.apiUrl.replace('/api', '') + url : url;
  }
}
