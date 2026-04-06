export type EmployeeStatus = 'active' | 'inactive' | 'terminated';

export interface Branch {
  branchId: string;
  branchName: string;
  address: string;
  totalEmployee: number;
}

export interface Employee {
  employeeId: string;
  fullName: string;
  dateOfBirth: string;
  idCard: string;
  phoneNumber: string;
  bankAccount?: string;
  position: string;
  status: EmployeeStatus;
  branchId: string;
  branchName: string;
  createdAt: string;
}

export interface EmployeeFilters {
  search?: string;
  branchId?: string;
  status?: EmployeeStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateEmployeePayload {
  fullName: string;
  dateOfBirth: string;
  idCard: string;
  phoneNumber: string;
  bankAccount?: string;
  position: string;
  branchId: string;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;
