import { ArticuloImagen } from './articulo-imagen';

export interface ArticuloDetalle {
  id: number;
  name: string;
  price: number;
  stock: number;
  isPrintOnDemand: boolean;
  requiresQuote: boolean;
  printTimeDays: number;
  highlights: string[];
  attributes: Record<string, string>;
  images: ArticuloImagen[];
}
