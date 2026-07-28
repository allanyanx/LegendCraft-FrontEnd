import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticuloService } from '../../core/services/articulo.service';
import { ArticuloLista } from '../../core/models/articulo-lista';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductSkeleton } from '../shop/components/product-skeleton/product-skeleton';
import { FaqItem } from './components/faq-item/faq-item';

interface CarouselSlide {
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, ProductSkeleton, FaqItem],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private articuloService = inject(ArticuloService);

  // PRODUCTOS RECIENTES
  articulosRecientes = signal<ArticuloLista[]>([]);
  isLoading = signal<boolean>(true);
  categoriaActiva = signal<string>('Nuevos');
  
  // Caché local para no sobrecargar el backend
  private cacheProductos = new Map<string, ArticuloLista[]>();

  // CARRUSEL
  diapositivas: CarouselSlide[] = [
    {
      title: 'LegendCraft',
      description: 'Descubre figuras exclusivas impresas en alta calidad para tu colección.',
      imageUrl: 'https://placehold.co/400x500/2B2B2B/E53935?text=Coleccionables',
    },
    {
      title: 'Impresión Bajo Demanda',
      description: 'Si no lo tenemos en stock, lo imprimimos especialmente para ti.',
      imageUrl: 'https://placehold.co/400x500/2B2B2B/FFFFFF?text=Impresion+3D',
    },
    {
      title: 'Cosplay & Props',
      description: 'Armaduras y accesorios a tamaño real listos para tu próximo evento.',
      imageUrl: 'https://placehold.co/400x500/2B2B2B/FFFFFF?text=Cosplay',
    }
  ];
  slideActual = signal<number>(0);
  private intervaloCarrusel: any;

  // PREGUNTAS FRECUENTES
  faqs = [
    {
      q: '¿Cómo se realiza el envío?',
      a: 'Hacemos envíos nacionales e internacionales a través de agencias certificadas. El tiempo de entrega varía según tu ubicación y si el producto es impreso bajo demanda.'
    },
    {
      q: '¿Cómo se realiza el pedido?',
      a: 'Agrega los artículos al carrito, ve a Pagar y completa tus datos. Si tienes cuenta, tus datos se autocompletarán. Puedes pagar por transferencia o PayPal.'
    },
    {
      q: '¿Qué materiales usan?',
      a: 'Utilizamos resina de alta precisión 8K y PLA reforzado, garantizando la máxima durabilidad y un nivel de detalle asombroso en cada figura.'
    }
  ];

  ngOnInit() {
    this.cargarProductosPreview();
    this.iniciarCarrusel();
  }

  cargarProductosPreview() {
    const busqueda = this.categoriaActiva() === 'Nuevos' ? '' : this.categoriaActiva();
    
    // 1. Revisar si ya tenemos esta categoría en caché
    if (this.cacheProductos.has(busqueda)) {
      this.articulosRecientes.set(this.cacheProductos.get(busqueda)!);
      return;
    }

    // 2. Si no está en caché, le pedimos al backend
    this.isLoading.set(true);
    this.articuloService.getArticulos(1, 4, busqueda).subscribe({
      next: (res) => {
        this.articulosRecientes.set(res.items);
        // Guardamos en caché para futuras consultas
        this.cacheProductos.set(busqueda, res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  cambiarCategoria(categoria: string) {
    this.categoriaActiva.set(categoria);
    this.cargarProductosPreview();
  }

  ngOnDestroy() {
    this.detenerCarrusel();
  }

  iniciarCarrusel() {
    if (typeof window !== 'undefined') {
      this.intervaloCarrusel = setInterval(() => {
        this.siguienteSlide();
      }, 5000);
    }
  }

  detenerCarrusel() {
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
    }
  }

  siguienteSlide() {
    this.slideActual.update(n => (n + 1) % this.diapositivas.length);
  }

  setSlide(index: number) {
    this.slideActual.set(index);
    this.detenerCarrusel();
    this.iniciarCarrusel(); 
  }
}
