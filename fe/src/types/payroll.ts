export type PayrollStatus = 'draft' | 'confirmed' | 'paid';

export interface Payroll {
  payrollId: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  monthNum: number;
  yearNum: number;
  baseSalary: number;
  allowance: number;
  salesPay: number;
  salesBonus: number;
  absBonus: number;
  deduction: number;
  netSalary: number;
  status: PayrollStatus;
  approveBy?: string;
}

export interface PaySlip {
  payslipId: string;
  payrollId: string;
  issueDate: string;
  salaryDetail: string;
  netAmount: number;
}

export interface PayrollFilters {
  monthNum?: number;
  yearNum?: number;
  branchId?: string;
  status?: PayrollStatus;
  page?: number;
  pageSize?: number;
}

export interface SalesImportRow {
  employeeId: string;
  salesAmount: number;
  date: string;
}

export interface SalesImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}
