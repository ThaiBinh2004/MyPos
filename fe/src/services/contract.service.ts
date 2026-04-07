import api from '@/lib/axios';
import type {
  Contract,
  ContractFilters,
  CreateContractPayload,
  UpdateContractPayload,
  PaginatedResponse,
} from '@/types';

export async function getContracts(
  filters?: ContractFilters
): Promise<PaginatedResponse<Contract>> {
  const { data } = await api.get<PaginatedResponse<Contract>>('/hr/contracts', {
    params: filters,
  });
  return data;
}

export async function getContract(id: string): Promise<Contract> {
  const { data } = await api.get<Contract>(`/hr/contracts/${id}`);
  return data;
}

export async function getEmployeeContracts(employeeId: string): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>(`/hr/employees/${employeeId}/contracts`);
  return data;
}

export async function createContract(payload: CreateContractPayload): Promise<Contract> {
  const { data } = await api.post<Contract>('/hr/contracts', payload);
  return data;
}

export async function updateContract(
  id: string,
  payload: UpdateContractPayload
): Promise<Contract> {
  const { data } = await api.patch<Contract>(`/hr/contracts/${id}`, payload);
  return data;
}

export async function approveContract(id: string): Promise<Contract> {
  const { data } = await api.post<Contract>(`/hr/contracts/${id}/approve`);
  return data;
}

export async function terminateContract(id: string, reason: string): Promise<Contract> {
  const { data } = await api.post<Contract>(`/hr/contracts/${id}/terminate`, { reason });
  return data;
}

export async function getExpiringContracts(days: number = 30): Promise<Contract[]> {
  const { data } = await api.get<Contract[]>('/hr/contracts/expiring', {
    params: { days },
  });
  return data;
}
