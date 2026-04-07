import api from '@/lib/axios';
import type {
  Employee,
  EmployeeFilters,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  Branch,
  PaginatedResponse,
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

export async function deactivateEmployee(id: string): Promise<void> {
  await api.patch(`/hr/employees/${id}/deactivate`);
}

export async function getBranches(): Promise<Branch[]> {
  const { data } = await api.get<Branch[]>('/hr/branches');
  return data;
}
