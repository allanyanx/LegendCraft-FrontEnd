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
import { ArticuloService } from '../../core/services/articulo.service';
import { AtributoService } from '../../core/services/atributo.service';
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
  private articuloService = inject(ArticuloService);
  private atributoService = inject(AtributoService);
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
  precioMaximo = signal<number>(200);
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
    this.route.queryParams.subscribe((params) => {
      this.terminoBusqueda.set(params['q'] || '');
      this.cargarDatos();
    });

    // Cargar los atributos dinámicos una sola vez al inicializar
    this.atributoService.getAtributos().subscribe({
      next: (attrs) => this.atributosDisponibles.set(attrs)
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
    this.articuloService.getArticulos(this.paginaActual(), this.itemsPorPagina(), this.terminoBusqueda(), arrAtributos)
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
  }

  actualizarOrden(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.criterioOrden.set(select.value);
    this.paginaActual.set(1);
  }
}
