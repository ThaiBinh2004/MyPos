export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'MISSING_CHECKOUT' | 'CORRECTED' | string;
export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;
export type KioskStatus = 'NOT_IN' | 'ON_TIME' | 'LATE' | 'DONE' | string;

export interface AttendanceRecord {
  attendanceId: number;
  employeeId: string;
  employeeName: string;
  dateWork: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  shiftType?: string;  // CA_SANG | CA_TOI
  status: AttendanceStatus;
  note?: string;
}

export interface TodayAttendance {
  employeeId: string;
  employeeName: string;
  position?: string;
  defaultShift?: string;
  attendanceId?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: KioskStatus;
}

export interface AttendanceCorrection {
  requestId: string;
  employeeId: string;
  employeeName: string;
  branchId?: string;
  attendanceId?: number;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  requestDate: string;
  status: CorrectionStatus;
  approvedByName?: string;
  reviewNote?: string;
}

export interface AttendanceFilters {
  branchId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface CorrectionPayload {
  employeeId: string;
  attendanceId?: number;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
}
