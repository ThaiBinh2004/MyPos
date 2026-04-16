export type ContractStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'TERMINATED' | 'EXPIRED';

export interface Contract {
  contractId: string;
  employeeId: string;
  employeeName: string;
  branchId?: string;
  branchName?: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  allowance: number;
  position?: string;
  workingHours?: string;
  leavePolicy?: string;
  otherTerms?: string;
  status: ContractStatus | string;
  approvedById?: string;
  approvedByName?: string;
  approvedDate?: string;
  reviewerNote?: string;
  signedByEmployee?: boolean;
  signedDate?: string;
  createdAt?: string;
}

export interface ContractFilters {
  branchId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateContractPayload {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  baseSalary: number;
  allowance?: number;
  position?: string;
  workingHours?: string;
  leavePolicy?: string;
  otherTerms?: string;
}

export type UpdateContractPayload = Partial<Omit<CreateContractPayload, 'employeeId'>>;
