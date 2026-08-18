import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id: number;
  articleId: number;
  articleName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/carts`;

  // Estado global reactivo del carrito
  cart = signal<CartResponse | null>(null);
  
  cartItemsCount = computed(() => {
    const current = this.cart();
    if (!current || !current.items) return 0;
    return current.items.reduce((acc, item) => acc + item.quantity, 0);
  });

  loadCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.apiUrl).pipe(
      tap(res => this.cart.set(res))
    );
  }

  addItem(articleId: number, quantity: number): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}/items`, { articleId, quantity }).pipe(
      tap(res => this.cart.set(res))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(`${this.apiUrl}/items/${itemId}`, { quantity }).pipe(
      tap(res => this.cart.set(res))
    );
  }

  removeItem(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(res => this.cart.set(res))
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.apiUrl).pipe(
      tap(() => this.cart.set(null))
    );
  }
}
