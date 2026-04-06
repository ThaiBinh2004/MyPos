export type Role = 'director' | 'branch_manager' | 'accountant' | 'employee';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
}
