export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
export interface PaginationResponse<T> {
  currentPage: number;
  pageSize: number;
  total: number;
  lastPage: number;
  data: T[];
}

export interface QueryRequest {
  pageSize: number;
  page: number;
  sortBy?: string;
  direction?: string;
}
