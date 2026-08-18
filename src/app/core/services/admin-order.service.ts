import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OrderResponse } from '../models/order-response';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.apiUrl}/all`);
  }

  updateOrderStatus(id: number, status: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
