import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtributoTipo } from '../models/atributo';

@Injectable({
  providedIn: 'root',
})
export class AtributoService {
  private http = inject(HttpClient);
  // NOTA: Temporalmente apuntando al backend real, luego se usará environment.ts
  private apiUrl = 'http://localhost:5000/api/attributes';

  getAtributos(): Observable<AtributoTipo[]> {
    return this.http.get<AtributoTipo[]>(this.apiUrl);
  }
}
