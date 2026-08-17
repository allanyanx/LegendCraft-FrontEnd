export interface ArticleListResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  isPrintOnDemand: boolean;
  printTimeDays: number;
  mainImageUrl: string;
}

export interface ArticleCreateRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  isPrintOnDemand: boolean;
  printTimeDays: number;
  highlights: string[];
  attributeValueIds: number[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
