import api from '@/lib/axios';
import type {
  Employee,
  EmployeeFilters,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  SelfUpdatePayload,
  Branch,
  PaginatedResponse,
  EmployeeProposal,
  CreateProposalPayload,
} from '@/types';

export async function getEmployees(
  filters?: EmployeeFilters
): Promise<PaginatedResponse<Employee>> {
  const { data } = await api.get<PaginatedResponse<Employee>>('/hr/employees', {
    params: filters,
  });
  return data;
}

export async function getEmployee(id: string): Promise<Employee> {
  const { data } = await api.get<Employee>(`/hr/employees/${id}`);
  return data;
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const { data } = await api.post<Employee>('/hr/employees', payload);
  return data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload
): Promise<Employee> {
  const { data } = await api.patch<Employee>(`/hr/employees/${id}`, payload);
  return data;
}

export async function selfUpdateEmployee(id: string, payload: SelfUpdatePayload): Promise<Employee> {
  const { data } = await api.patch<Employee>(`/hr/employees/${id}/self`, payload);
  return data;
}

export async function updateEmployeeShift(id: string, defaultShift: string): Promise<Employee> {
  const { data } = await api.patch<Employee>(`/hr/employees/${id}/shift`, { defaultShift });
  return data;
}

export async function deactivateEmployee(id: string): Promise<void> {
  await api.patch(`/hr/employees/${id}/deactivate`);
}

export async function getBranches(): Promise<Branch[]> {
  const { data } = await api.get<Branch[]>('/hr/branches');
  return data;
}

export async function getProposals(status?: string): Promise<EmployeeProposal[]> {
  const { data } = await api.get<EmployeeProposal[]>('/hr/proposals', { params: status ? { status } : {} });
  return data;
}

export async function createProposal(payload: CreateProposalPayload): Promise<EmployeeProposal> {
  const { data } = await api.post<EmployeeProposal>('/hr/proposals', payload);
  return data;
}

export async function approveProposal(id: string, reviewerNote?: string): Promise<EmployeeProposal> {
  const { data } = await api.patch<EmployeeProposal>(`/hr/proposals/${id}/approve`, { reviewerNote });
  return data;
}

export async function rejectProposal(id: string, reviewerNote?: string): Promise<EmployeeProposal> {
  const { data } = await api.patch<EmployeeProposal>(`/hr/proposals/${id}/reject`, { reviewerNote });
  return data;
}

export interface EmployeeAccount {
  accountId: string;
  username: string;
  role: string;
  isActive: boolean;
}

export async function getEmployeeAccount(employeeId: string): Promise<EmployeeAccount | null> {
  try {
    const { data } = await api.get<EmployeeAccount>(`/hr/employees/${employeeId}/account`);
    return data;
  } catch {
    return null;
  }
}

export async function changeEmployeePassword(
  employeeId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await api.patch(`/hr/employees/${employeeId}/account/change-password`, { oldPassword, newPassword });
}

export async function createEmployeeAccount(
  employeeId: string,
  username: string,
  password: string,
  role: string
): Promise<EmployeeAccount> {
  const { data } = await api.post<EmployeeAccount>(`/hr/employees/${employeeId}/account`, {
    username, password, role,
  });
  return data;
}
