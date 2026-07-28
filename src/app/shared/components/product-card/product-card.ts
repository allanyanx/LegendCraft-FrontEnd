import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common'; // Importación ultra específica
import { ArticuloLista } from '../../../core/models/articulo-lista';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe, RouterModule],
  templateUrl: './product-card.html',
})
export class ProductCard {
  articulo = input.required<ArticuloLista>();
}
