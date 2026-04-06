export type AttendanceStatus =
  | 'on_time'
  | 'late'
  | 'early_leave'
  | 'absent'
  | 'missing_checkout';

export type CorrectionStatus = 'pending' | 'approved' | 'rejected';

export interface AttendanceRecord {
  attendanceId: number;
  employeeId: string;
  employeeName: string;
  dateWork: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceCorrection {
  requestId: number;
  employeeId: string;
  employeeName: string;
  attendanceId: number;
  requestDate: string;
  status: CorrectionStatus;
  approvedBy?: string;
}

export interface AttendanceFilters {
  branchId?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
  page?: number;
  pageSize?: number;
}

export interface KioskCheckinPayload {
  employeeId: string;
  pin: string;
}

export interface KioskCheckoutPayload {
  employeeId: string;
  pin: string;
}

export interface CorrectionRequestPayload {
  attendanceId: number;
  reason: string;
}

export interface ReviewCorrectionPayload {
  status: CorrectionStatus;
}
