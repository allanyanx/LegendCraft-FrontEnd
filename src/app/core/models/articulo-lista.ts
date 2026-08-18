export interface ArticuloLista {
  id: number;
  name: string;
  price: number;
  stock: number;
  isPrintOnDemand: boolean;
  requiresQuote: boolean;
  printTimeDays: number;
  isOnSale: boolean;
  discountPrice?: number;
  discountPercentage?: number;
  mainImageUrl: string;
}
