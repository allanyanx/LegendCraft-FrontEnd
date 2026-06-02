import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  afterNextRender,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ProductCard } from './components/product-card/product-card';
import { ProductSkeleton } from './components/product-skeleton/product-skeleton';
import { EmptyState } from './components/empty-state/empty-state';
import { ArticuloService } from '../../core/services/articulo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/categoria';
import { Articulo } from '../../core/models/articulo';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ProductCard, ProductSkeleton, EmptyState, NgTemplateOutlet],
  templateUrl: './shop.html',
})
export class Shop implements OnInit, OnDestroy {
  // INYECCIONES DE DEPENDENCIAS
  private articuloService = inject(ArticuloService);
  private categoriaService = inject(CategoriaService);

  // ESTADOS BASE (WRITABLE SIGNALS)
  // -- Carga, Datos y UI --
  isLoading = signal<boolean>(true);
  articulos = signal<Articulo[]>([]);
  categorias = signal<Categoria[]>([]);
  terminoBusqueda = signal<string | null>('Warhammer'); // Simulado
  isFilterMenuOpen = signal<boolean>(false);

  // -- Filtros Activos y UI de Filtros --
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

  precioMaximo = signal<number>(200);

  // -- Ordenamiento y Paginación --
  criterioOrden = signal<string>('relevantes');
  paginaActual = signal<number>(1);
  itemsPorPagina = signal<number>(20); // Valor por defecto antes del cálculo móvil

  // ESTADOS DERIVADOS (COMPUTED SIGNALS)
  // Extrae los atributos únicos de los artículos para construir el menú de filtros
  filtrosDisponibles = computed(() => {
    const arts = this.articulos();
    const franquicias = new Set<string>();
    const materiales = new Set<string>();
    const tamanos = new Set<string>();

    arts.forEach((a) => {
      if (a.atributos?.['franquicia']) franquicias.add(a.atributos['franquicia']);
      if (a.atributos?.['material']) materiales.add(a.atributos['material']);
      if (a.atributos?.['tamano']) tamanos.add(a.atributos['tamano']);
    });

    return {
      franquicias: Array.from(franquicias).sort(),
      materiales: Array.from(materiales).sort(),
      tamanos: Array.from(tamanos).sort(),
    };
  });

  // El "Colador": Filtra y ordena la lista original
  articulosFiltrados = computed(() => {
    const todos = this.articulos();
    const activos = this.filtrosActivos();
    const pMax = this.precioMaximo();
    const orden = this.criterioOrden();

    // Aplicar Filtros
    const filtrados = todos.filter((art) => {
      const pasaCategoria =
        activos.categorias.length === 0 || activos.categorias.includes(art.idCategoria);
      const pasaFranquicia =
        activos.franquicias.length === 0 ||
        (art.atributos?.['franquicia'] &&
          activos.franquicias.includes(art.atributos['franquicia']));
      const pasaMaterial =
        activos.materiales.length === 0 ||
        (art.atributos?.['material'] && activos.materiales.includes(art.atributos['material']));
      const pasaTamano =
        activos.tamanos.length === 0 ||
        (art.atributos?.['tamano'] && activos.tamanos.includes(art.atributos['tamano']));
      const pasaPrecio = art.precio <= pMax;

      return pasaCategoria && pasaFranquicia && pasaMaterial && pasaTamano && pasaPrecio;
    });

    // Aplicar Ordenamiento
    return [...filtrados].sort((a, b) => {
      switch (orden) {
        case 'precio_asc':
          return a.precio - b.precio;
        case 'precio_desc':
          return b.precio - a.precio;
        case 'nombre_asc':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre_desc':
          return b.nombre.localeCompare(a.nombre);
        case 'reciente':
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        case 'antiguo':
          return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime();
        default:
          return 0;
      }
    });
  });

  // Genera el arreglo de páginas [1, 2, 3...]
  paginasArray = computed(() => {
    const total = Math.ceil(this.articulosFiltrados().length / this.itemsPorPagina());
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Recorta el arreglo filtrado para mostrar solo los items de la página actual
  articulosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.itemsPorPagina();
    const fin = inicio + this.itemsPorPagina();
    return this.articulosFiltrados().slice(inicio, fin);
  });

  // CONSTRUCTOR Y CICLO DE VIDA
  // Guardamos la referencia a la función para poder eliminarla después
  private resizeListener = () => this.ajustarPaginacion();

  constructor() {
    // afterNextRender garantiza que el código se ejecute en el navegador (evita errores SSR)
    afterNextRender(() => {
      this.ajustarPaginacion();
      window.addEventListener('resize', this.resizeListener);
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    // Limpiamos el event listener para evitar fugas de memoria si el usuario sale de la tienda
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  // MÉTODOS Y MANEJADORES DE EVENTOS
  // Obtiene los datos de las APIs
  cargarDatos() {
    this.isLoading.set(true);

    this.categoriaService.getCategorias().subscribe((cats) => {
      this.categorias.set(cats);

      this.articuloService.getArticulos().subscribe((arts) => {
        this.articulos.set(arts);
        this.isLoading.set(false);
      });
    });
  }

  // Detecta si es móvil (<768px) y asigna 6 o 20 ítems por página
  ajustarPaginacion() {
    const esMovil = window.innerWidth < 768;
    this.itemsPorPagina.set(esMovil ? 6 : 20);
    this.paginaActual.set(1);
  }

  // Alterna el estado (marcado/desmarcado) de un checkbox en los filtros
  toggleFiltro(tipo: 'categorias' | 'franquicias' | 'materiales' | 'tamanos', valor: any) {
    this.filtrosActivos.update((filtros) => {
      const nuevosFiltros = { ...filtros };
      const valorLimpio = tipo === 'categorias' ? Number(valor) : valor;
      const index = nuevosFiltros[tipo].indexOf(valorLimpio as never);

      if (index > -1) {
        nuevosFiltros[tipo].splice(index, 1);
      } else {
        nuevosFiltros[tipo].push(valorLimpio as never);
      }

      return nuevosFiltros;
    });

    this.paginaActual.set(1);
  }

  // Alterna el estado de "Ver más..." / "Ver menos" en las listas de filtros largas
  toggleExpandir(filtro: 'categorias' | 'franquicias' | 'materiales' | 'tamanos') {
    this.filtrosExpandidos.update((v) => ({ ...v, [filtro]: !v[filtro] }));
  }

  // Actualiza el límite de precio desde el input range
  actualizarPrecio(event: Event) {
    const input = event.target as HTMLInputElement;
    this.precioMaximo.set(Number(input.value));
    this.paginaActual.set(1);
  }

  // Actualiza el criterio de ordenamiento desde el combobox
  actualizarOrden(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.criterioOrden.set(select.value);
    this.paginaActual.set(1);
  }

  // Permite al usuario navegar entre las páginas de resultados
  cambiarPagina(pagina: number) {
    this.paginaActual.set(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
