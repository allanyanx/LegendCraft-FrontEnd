import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
})
export class Cart implements OnInit {
  cartService = inject(CartService);

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }

  getImageUrl(url: string | undefined): string {
    
    if (!url) return 'assets/placeholder.jpg';
    return url.startsWith('/') ? environment.apiUrl.replace('/api', '') + url : url;
  }

  updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;
    this.cartService.updateItem(itemId, newQuantity).subscribe();
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId).subscribe();
  }
}
