import api from '@/lib/axios';
import type { Payroll, SalesRecord, PayrollDeduction, UpdatePayrollPayload, AddDeductionPayload } from '@/types';

export async function getPayrolls(month: string, branchId?: string): Promise<Payroll[]> {
  const { data } = await api.get<Payroll[]>('/hr/payroll', { params: { month, branchId } });
  return data;
}

export async function getMyPayrolls(employeeId: string): Promise<Payroll[]> {
  const { data } = await api.get<Payroll[]>('/hr/payroll/my', { params: { employeeId } });
  return data;
}

export async function getPayroll(id: string): Promise<Payroll> {
  const { data } = await api.get<Payroll>(`/hr/payroll/${id}`);
  return data;
}

export async function generatePayroll(employeeId: string, month: string, createdById?: string): Promise<Payroll> {
  const { data } = await api.post<Payroll>('/hr/payroll/generate', { employeeId, month, createdById });
  return data;
}

export async function generateBulk(month: string, branchId?: string, createdById?: string): Promise<{ generated: number; data: Payroll[] }> {
  const { data } = await api.post('/hr/payroll/generate-bulk', { month, branchId, createdById });
  return data;
}

export async function updatePayroll(id: string, payload: UpdatePayrollPayload): Promise<Payroll> {
  const { data } = await api.patch<Payroll>(`/hr/payroll/${id}`, payload);
  return data;
}

export async function finalizePayroll(id: string): Promise<Payroll> {
  const { data } = await api.patch<Payroll>(`/hr/payroll/${id}/finalize`);
  return data;
}

export async function getSalesRecords(month: string, branchId?: string): Promise<SalesRecord[]> {
  const { data } = await api.get<SalesRecord[]>('/hr/payroll/sales', { params: { month, branchId } });
  return data;
}

export async function importSales(file: File, month: string, importedBy?: string): Promise<{ imported: number; message: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('month', month);
  if (importedBy) form.append('importedBy', importedBy);
  const { data } = await api.post('/hr/payroll/sales/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getDeductions(month: string, branchId?: string): Promise<PayrollDeduction[]> {
  const { data } = await api.get<PayrollDeduction[]>('/hr/payroll/deductions', { params: { month, branchId } });
  return data;
}

export async function addDeduction(payload: AddDeductionPayload): Promise<void> {
  await api.post('/hr/payroll/deductions', payload);
}
