import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ArticleService } from '../../core/services/article.service';
import { BannerService } from '../../core/services/banner.service';
import { FaqService } from '../../core/services/faq.service';
import { ArticuloLista } from '../../core/models/articulo-lista';
import { BannerLista } from '../../core/models/banner-lista';
import { FaqLista } from '../../core/models/faq-lista';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductSkeleton } from '../shop/components/product-skeleton/product-skeleton';
import { FaqItem } from './components/faq-item/faq-item';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, ProductSkeleton, FaqItem],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  private articuloService = inject(ArticleService);
  private bannerService = inject(BannerService);
  private faqService = inject(FaqService);

  // PRODUCTOS RECIENTES
  articulosRecientes = signal<ArticuloLista[]>([]);
  isLoading = signal<boolean>(true);
  categoriaActiva = signal<string>('Nuevos');
  
  // Caché local para no sobrecargar el backend
  private cacheProductos = new Map<string, ArticuloLista[]>();

  // CARRUSEL
  diapositivas = signal<BannerLista[]>([]);
  slideActual = signal<number>(0);
  private intervaloCarrusel: any;

  // PREGUNTAS FRECUENTES
  faqs = signal<FaqLista[]>([]);

  ngOnInit() {
    this.cargarBanners();
    this.cargarFaqs();
    this.cargarProductosPreview();
  }

  cargarFaqs() {
    this.faqService.getFaqs().subscribe({
      next: (faqs) => this.faqs.set(faqs),
      error: (err) => console.error('Error al cargar faqs', err)
    });
  }

  cargarBanners() {
    this.bannerService.getBanners().subscribe({
      next: (banners) => {
        this.diapositivas.set(banners);
        if (banners.length > 0) {
          this.iniciarCarrusel();
        }
      },
      error: (err) => console.error('Error al cargar banners', err)
    });
  }

  cargarProductosPreview() {
    let busqueda = '';
    let sortBy = '';
    let isPrintOnDemand: boolean | undefined = undefined;
    let isOnSale: boolean | undefined = undefined;

    switch(this.categoriaActiva()) {
      case 'Nuevos':
        sortBy = 'reciente';
        break;
      case 'Más Relevantes':
        sortBy = 'relevantes';
        break;
      case 'Ofertas':
        isOnSale = true;
        break;
      case 'Bajo Pedido':
        isPrintOnDemand = true;
        break;
    }
    
    const cacheKey = this.categoriaActiva();

    if (this.cacheProductos.has(cacheKey)) {
      this.articulosRecientes.set(this.cacheProductos.get(cacheKey)!);
      return;
    }

    this.isLoading.set(true);
    this.articuloService.getArticles(1, 4, busqueda, [], undefined, sortBy, isPrintOnDemand, isOnSale).subscribe({
      next: (res: any) => {
        this.articulosRecientes.set(res.items);
        this.cacheProductos.set(cacheKey, res.items);
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
    this.slideActual.update(n => (n + 1) % this.diapositivas().length);
  }

  setSlide(index: number) {
    this.slideActual.set(index);
    this.detenerCarrusel();
    this.iniciarCarrusel(); 
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    return url.startsWith('/') ? environment.apiUrl.replace('/api', '') + url : url;
  }
}
