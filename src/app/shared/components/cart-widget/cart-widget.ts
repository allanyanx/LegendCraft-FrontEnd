import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart-widget',
  imports: [RouterModule],
  templateUrl: './cart-widget.html',
  styleUrl: './cart-widget.css',
})
export class CartWidget {
  private cartService = inject(CartService);
  cartItemsCount = this.cartService.cartItemsCount;
}
