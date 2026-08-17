import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.html',
})
export class SearchBar {
  private router = inject(Router);
  searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(term => {
      this.ejecutarBusqueda(term);
    });
  }

  onInput(termino: string) {
    this.searchSubject.next(termino);
  }

  ejecutarBusqueda(termino: string) {
    const busquedaLimpiada = termino.trim();

    if (busquedaLimpiada) {
      this.router.navigate(['/shop'], { queryParams: { q: busquedaLimpiada } });
    } else {
      this.router.navigate(['/shop']);
    }
  }
}
