import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AttributeTypeResponse, AttributeTypeCreateRequest, AttributeValueCreateRequest } from '../models/attribute';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Attributes`;

  getAllAttributes(): Observable<AttributeTypeResponse[]> {
    return this.http.get<AttributeTypeResponse[]>(this.apiUrl);
  }

  createAttributeType(data: AttributeTypeCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/types`, data);
  }

  createAttributeValue(typeId: number, data: AttributeValueCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/types/${typeId}/values`, data);
  }
}
