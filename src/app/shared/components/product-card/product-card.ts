import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common'; // Importación ultra específica
import { Articulo } from '../../../core/models/articulo';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  articulo = input.required<Articulo>();
}
