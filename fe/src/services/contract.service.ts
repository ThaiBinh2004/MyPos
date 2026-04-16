import api from '@/lib/axios';
import type { Contract, ContractFilters, CreateContractPayload, UpdateContractPayload } from '@/types';

export async function getContracts(filters?: ContractFilters): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>('/hr/contracts', { params: filters });
  return data;
}

export async function getContract(id: string): Promise<Contract> {
  const { data } = await api.get<Contract>(`/hr/contracts/${id}`);
  return data;
}

export async function getEmployeeContracts(employeeId: string): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>(`/hr/contracts/by-employee/${employeeId}`);
  return data;
}

export async function createContract(payload: CreateContractPayload): Promise<Contract> {
  const { data } = await api.post<Contract>('/hr/contracts', payload);
  return data;
}

export async function updateContract(id: string, payload: UpdateContractPayload): Promise<Contract> {
  const { data } = await api.patch<Contract>(`/hr/contracts/${id}`, payload);
  return data;
}

export async function submitContract(id: string): Promise<Contract> {
  const { data } = await api.post<Contract>(`/hr/contracts/${id}/submit`);
  return data;
}

export async function approveContract(id: string, approvedById: string, reviewerNote?: string): Promise<Contract> {
  const { data } = await api.post<Contract>(`/hr/contracts/${id}/approve`, { approvedById, reviewerNote });
  return data;
}

export async function rejectContract(id: string, reviewerNote?: string): Promise<Contract> {
  const { data } = await api.post<Contract>(`/hr/contracts/${id}/reject`, { reviewerNote });
  return data;
}

export async function terminateContract(id: string): Promise<void> {
  await api.post(`/hr/contracts/${id}/terminate`);
}

export async function signContract(id: string): Promise<Contract> {
  const { data } = await api.post<Contract>(`/hr/contracts/${id}/sign`);
  return data;
}

export async function getExpiringContracts(days: number = 30, branchId?: string): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>('/hr/contracts/expiring', { params: { days, branchId } });
  return data;
}
