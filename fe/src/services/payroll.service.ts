import api from '@/lib/axios';
import type {
  Payroll,
  PaySlip,
  PayrollFilters,
  SalesImportRow,
  SalesImportResult,
  PaginatedResponse,
} from '@/types';

export async function getPayrolls(
  filters?: PayrollFilters
): Promise<PaginatedResponse<Payroll>> {
  const { data } = await api.get<PaginatedResponse<Payroll>>('/hr/payroll', {
    params: filters,
  });
  return data;
}

export async function getPayroll(id: string): Promise<Payroll> {
  const { data } = await api.get<Payroll>(`/hr/payroll/${id}`);
  return data;
}

export async function getPaySlip(payrollId: string): Promise<PaySlip> {
  const { data } = await api.get<PaySlip>(`/hr/payroll/${payrollId}/payslip`);
  return data;
}

export async function generatePayroll(
  monthNum: number,
  yearNum: number,
  branchId?: string
): Promise<void> {
  await api.post('/hr/payroll/generate', { monthNum, yearNum, branchId });
}

export async function confirmPayroll(
  monthNum: number,
  yearNum: number,
  branchId?: string
): Promise<void> {
  await api.post('/hr/payroll/confirm', { monthNum, yearNum, branchId });
}

export async function markAsPaid(
  monthNum: number,
  yearNum: number,
  branchId?: string
): Promise<void> {
  await api.post('/hr/payroll/mark-paid', { monthNum, yearNum, branchId });
}

export async function importSalesData(
  monthNum: number,
  yearNum: number,
  rows: SalesImportRow[]
): Promise<SalesImportResult> {
  const { data } = await api.post<SalesImportResult>('/hr/payroll/import-sales', {
    monthNum,
    yearNum,
    rows,
  });
  return data;
}

export async function exportPayroll(
  monthNum: number,
  yearNum: number,
  branchId?: string
): Promise<Blob> {
  const { data } = await api.get<Blob>('/hr/payroll/export', {
    params: { monthNum, yearNum, branchId },
    responseType: 'blob',
  });
  return data;
}
