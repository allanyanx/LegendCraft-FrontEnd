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
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductSkeleton } from './components/product-skeleton/product-skeleton';
import { ArticleService } from '../../core/services/article.service';
import { AttributeService } from '../../core/services/attribute.service';
import { ArticuloLista } from '../../core/models/articulo-lista';
import { AtributoTipo } from '../../core/models/atributo-tipo';
import { EmptyState } from './components/empty-state/empty-state';
import { FilterSidebar } from './components/filter-sidebar/filter-sidebar';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductCard, ProductSkeleton, EmptyState, FilterSidebar],
  templateUrl: './shop.html',
})
export class Shop implements OnInit, OnDestroy {
  private articuloService = inject(ArticleService);
  private atributoService = inject(AttributeService);
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

  // Filtros UI Dinámicos
  atributosDisponibles = signal<AtributoTipo[]>([]);
  precioMaximo = signal<number>(400);
  criterioOrden = signal<string>('relevantes');

  // Set de IDs de los valores de atributo seleccionados
  filtrosActivos = signal<Set<number>>(new Set());

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
    // Cargar los atributos dinámicos una sola vez al inicializar
    this.atributoService.getAllAttributes().subscribe({
      next: (attrs: any) => this.atributosDisponibles.set(attrs)
    });

    this.route.queryParams.subscribe((params) => {
      this.terminoBusqueda.set(params['q'] || '');
      
      const attrParam = params['attr'];
      if (attrParam) {
        const attrId = parseInt(attrParam, 10);
        if (!isNaN(attrId)) {
          this.filtrosActivos.set(new Set([attrId]));
        }
      }
      
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

    const arrAtributos = Array.from(this.filtrosActivos());

    // Llamada real al backend con paginación y atributos
    this.articuloService.getArticles(this.paginaActual(), this.itemsPorPagina(), this.terminoBusqueda(), arrAtributos, this.precioMaximo(), this.criterioOrden())
      .subscribe({
        next: (response: any) => {
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

  // Lógica de Filtros Dinámicos
  toggleFiltro(valorId: number) {
    this.filtrosActivos.update((set) => {
      const nuevoSet = new Set(set);
      if (nuevoSet.has(valorId)) {
        nuevoSet.delete(valorId);
      } else {
        nuevoSet.add(valorId);
      }
      return nuevoSet;
    });
    this.paginaActual.set(1);
    this.cargarDatos(); // Llama a la API con los nuevos filtros
  }

  actualizarPrecioDirecto(nuevoPrecio: number) {
    this.precioMaximo.set(nuevoPrecio);
    this.paginaActual.set(1);
    this.cargarDatos();
  }

  actualizarOrden(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.criterioOrden.set(select.value);
    this.paginaActual.set(1);
    this.cargarDatos();
  }
}
