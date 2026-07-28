import { Component, input, output, signal } from '@angular/core';
import { AtributoTipo } from '../../../../core/models/atributo';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  templateUrl: './filter-sidebar.html'
})
export class FilterSidebar {
  atributosDisponibles = input.required<AtributoTipo[]>();
  filtrosActivos = input.required<Set<number>>();
  precioMaximo = input.required<number>();

  onFiltroToggle = output<number>();
  onPrecioChange = output<number>();

  filtrosExpandidos = signal<Record<number, boolean>>({});

  toggleExpandir(tipoId: number) {
    this.filtrosExpandidos.update(v => ({ ...v, [tipoId]: !v[tipoId] }));
  }
}
