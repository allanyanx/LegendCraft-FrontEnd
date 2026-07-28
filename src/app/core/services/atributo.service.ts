import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtributoTipo } from '../models/atributo-tipo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AtributoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attributes`;

  getAtributos(): Observable<AtributoTipo[]> {
    return this.http.get<AtributoTipo[]>(this.apiUrl);
  }
}
