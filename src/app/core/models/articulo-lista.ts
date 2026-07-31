export interface ArticuloLista {
  id: number;
  name: string;
  price: number;
  stock: number;
  isPrintOnDemand: boolean;
  requiresQuote: boolean;
  printTimeDays: number;
  mainImageUrl: string;
}
