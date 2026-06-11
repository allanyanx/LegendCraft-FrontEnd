import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Articulo } from '../models/articulo';

@Injectable({
  providedIn: 'root',
})
export class ArticuloService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/articulos';

  getArticulos(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(this.apiUrl);
  }

  getArticuloById(id: number): Observable<Articulo> {
    return this.http.get<Articulo>(`${this.apiUrl}/${id}`);
  }
}
