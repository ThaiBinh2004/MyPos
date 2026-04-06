export type ContractStatus = 'active' | 'expired' | 'terminated' | 'pending';

export interface Contract {
  contractId: string;
  employeeId: string;
  employeeName: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  allowance: number;
  status: ContractStatus;
  approvedBy?: string;
  approvedDate?: string;
}

export interface ContractFilters {
  search?: string;
  branchId?: string;
  status?: ContractStatus;
  expiringDays?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateContractPayload {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  allowance: number;
}

export type UpdateContractPayload = Partial<CreateContractPayload>;
