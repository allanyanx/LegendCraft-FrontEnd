import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArticuloLista } from '../models/articulo-lista';
import { ArticuloDetalle } from '../models/articulo-detalle';
import { PagedResult } from '../models/paged-result';

@Injectable({
  providedIn: 'root',
})
export class ArticuloService {
  private http = inject(HttpClient);
  // NOTA: Temporalmente apuntando al backend real, luego se usará environment.ts
  private apiUrl = 'http://localhost:5000/api/articles';

  getArticulos(pageNumber: number = 1, pageSize: number = 20, search: string = '', attributeValues: number[] = []): Observable<PagedResult<ArticuloLista>> {
    let url = `${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;
    
    // Adjuntamos los filtros como un array al QueryString (Ej: &attributeValues=1&attributeValues=3)
    if (attributeValues && attributeValues.length > 0) {
      attributeValues.forEach(val => {
        url += `&attributeValues=${val}`;
      });
    }

    return this.http.get<PagedResult<ArticuloLista>>(url);
  }

  getArticuloById(id: number): Observable<ArticuloDetalle> {
    return this.http.get<ArticuloDetalle>(`${this.apiUrl}/${id}`);
  }
}
