import { Component, input, output, signal } from '@angular/core';
import { AtributoTipo } from '../../../../core/models/atributo-tipo';

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

  activeAccordionId = signal<number | null>(null);

  toggleAccordion(tipoId: number) {
    this.activeAccordionId.update(current => current === tipoId ? null : tipoId);
  }

  getActiveFilterCountForType(tipo: AtributoTipo): number {
    return tipo.values.filter(v => this.filtrosActivos().has(v.id)).length;
  }
}
