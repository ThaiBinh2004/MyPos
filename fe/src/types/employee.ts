export type EmployeeStatus = 'ACTIVE' | 'RESIGNED' | 'inactive';

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
  gender?: string;
  idCard: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  bankAccount?: string;
  position: string;
  department?: string;
  status: string;
  branchId: string;
  branchName: string;
  createdAt: string;
}

export interface EmployeeFilters {
  search?: string;
  branchId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateEmployeePayload {
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  idCard: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  bankAccount?: string;
  position: string;
  department?: string;
  branchId: string;
}

export interface SelfUpdatePayload {
  phoneNumber?: string;
  address?: string;
  bankAccount?: string;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export interface EmployeeProposal {
  proposalId: string;
  employeeId: string;
  employeeName: string;
  proposedBy: string;
  proposedByName: string;
  proposedPosition: string;
  proposedDepartment: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerNote: string;
  createdAt: string;
}

export interface CreateProposalPayload {
  employeeId: string;
  proposedBy: string;
  proposedByName: string;
  proposedPosition?: string;
  proposedDepartment?: string;
  reason: string;
}
