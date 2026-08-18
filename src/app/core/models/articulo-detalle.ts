import { ArticuloImagen } from './articulo-imagen';

export interface ArticuloDetalle {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isPrintOnDemand: boolean;
  requiresQuote: boolean;
  printTimeDays: number;
  isOnSale: boolean;
  discountPrice?: number;
  discountPercentage?: number;
  highlights: string[];
  attributes: Record<string, string>;
  images: ArticuloImagen[];
}
