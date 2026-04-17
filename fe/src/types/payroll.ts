export type PayrollStatus = 'DRAFT' | 'FINALIZED';

export interface Payroll {
  payrollId: string;
  employeeId: string;
  employeeName: string;
  position?: string;
  branchId: string;
  branchName?: string;
  month: string; // "YYYY-MM"

  // Ngày công
  workDays: number;
  leaveDays: number;

  // OT
  otHours: number;
  otHolidayHours: number;

  // Lương
  baseSalary: number;     // mức lương HĐ
  basePay: number;        // thực nhận theo ngày công
  allowance: number;      // phụ cấp HĐ
  allowanceRate: number;  // hệ số điều chỉnh (0.5–1.0)
  allowancePay: number;

  // OT pay
  overtimePay: number;

  // Thưởng doanh số
  hotBonus: number;
  livestreamBonus: number;
  salesBonus: number;

  // Thưởng ABC
  abcRating?: string;
  abcBonus: number;

  // Tổng & khấu trừ
  totalGross: number;
  bhxhEmployee: number;
  tncn: number;
  advance: number;
  penalty: number;
  deduction: number;

  // Lương thực nhận
  netSalary: number;

  status: PayrollStatus;
  note?: string;
  approvedBy?: string;
  createdAt?: string;
  finalizedAt?: string;
}

export interface SalesRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  shiftDate: string;
  shift?: string;
  salesAmount: number;
  productCount: number;
}

export interface PayrollDeduction {
  id: number;
  employeeId: string;
  employeeName: string;
  type: 'ADVANCE' | 'PENALTY';
  amount: number;
  reason: string;
  month: string;
  status: string;
}

export interface UpdatePayrollPayload {
  leaveDays?: number;
  otHours?: number;
  otHolidayHours?: number;
  allowanceRate?: number;
  abcRating?: string;
  note?: string;
}

export interface AddDeductionPayload {
  employeeId: string;
  type: 'ADVANCE' | 'PENALTY';
  amount: number;
  reason: string;
  month: string;
  approvedById?: string;
}
