import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common'; // Importación ultra específica
import { ArticuloLista } from '../../../core/models/articulo-lista';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe, RouterModule],
  templateUrl: './product-card.html',
})
export class ProductCard {
  articulo = input.required<ArticuloLista>();

  get imageUrl() {
    const url = this.articulo().mainImageUrl;
    if (!url) return '';
    // if url starts with /, prepend the backend host (without /api)
    return url.startsWith('/') ? environment.apiUrl.replace('/api', '') + url : url;
  }
}
