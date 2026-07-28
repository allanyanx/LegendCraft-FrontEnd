import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  afterNextRender,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductSkeleton } from './components/product-skeleton/product-skeleton';
import { ArticuloService } from '../../core/services/articulo.service';
import { ArticuloLista } from '../../core/models/articulo-lista';
import { EmptyState } from './components/empty-state/empty-state';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductCard, ProductSkeleton, EmptyState, NgTemplateOutlet],
  templateUrl: './shop.html',
})
export class Shop implements OnInit, OnDestroy {
  private articuloService = inject(ArticuloService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estados Base
  isLoading = signal<boolean>(true);
  articulos = signal<ArticuloLista[]>([]);
  terminoBusqueda = signal<string>('');
  isFilterMenuOpen = signal<boolean>(false);

  // Paginación (Servidor)
  totalItems = signal<number>(0);
  paginaActual = signal<number>(1);
  itemsPorPagina = signal<number>(20);

  // Filtros UI (Mantenidos temporalmente como stubs para que el HTML compile)
  categorias = signal<any[]>([]);
  precioMaximo = signal<number>(200);
  criterioOrden = signal<string>('relevantes');

  filtrosActivos = signal({
    categorias: [] as number[],
    franquicias: [] as string[],
    materiales: [] as string[],
    tamanos: [] as string[],
  });

  filtrosExpandidos = signal({
    categorias: false,
    franquicias: false,
    materiales: false,
    tamanos: false,
  });

  filtrosDisponibles = signal({
    franquicias: [] as string[],
    materiales: [] as string[],
    tamanos: [] as string[],
  });

  // Computed
  textoResultados = computed(() => {
    const total = this.totalItems();
    if (total === 0) return '0 resultados encontrados';
    const inicio = (this.paginaActual() - 1) * this.itemsPorPagina() + 1;
    const fin = Math.min(this.paginaActual() * this.itemsPorPagina(), total);
    return `Mostrando ${inicio} - ${fin} de ${total} resultados`;
  });

  articulosPaginados = computed(() => this.articulos());

  paginasArray = computed(() => {
    const total = Math.ceil(this.totalItems() / this.itemsPorPagina());
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  private resizeListener = () => this.ajustarPaginacion();

  constructor() {
    afterNextRender(() => {
      this.ajustarPaginacion();
      window.addEventListener('resize', this.resizeListener);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.terminoBusqueda.set(params['q'] || '');
      this.cargarDatos();
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  cargarDatos() {
    this.isLoading.set(true);
    // Llamada real al backend con paginación
    this.articuloService.getArticulos(this.paginaActual(), this.itemsPorPagina(), this.terminoBusqueda())
      .subscribe({
        next: (response) => {
          this.articulos.set(response.items);
          this.totalItems.set(response.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  ajustarPaginacion() {
    const esMovil = window.innerWidth < 768;
    const nuevoTamano = esMovil ? 6 : 20;
    if (this.itemsPorPagina() !== nuevoTamano) {
      this.itemsPorPagina.set(nuevoTamano);
      this.paginaActual.set(1);
      this.cargarDatos();
    }
  }

  cambiarPagina(pagina: number) {
    this.paginaActual.set(pagina);
    this.cargarDatos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Stubs para evitar errores en HTML temporalmente
  toggleFiltro(tipo: any, valor: any) {}
  toggleExpandir(filtro: any) {}
  actualizarPrecio(event: Event) {}
  actualizarOrden(event: Event) {}
}
