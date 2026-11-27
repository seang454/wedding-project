export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  data: T;
  message?: string;
}

export interface PageMeta {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}
