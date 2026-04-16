import api from '@/lib/axios';
import type {
  AttendanceRecord, AttendanceFilters, AttendanceCorrection,
  TodayAttendance, CorrectionPayload,
} from '@/types';

export async function getAttendanceRecords(filters?: AttendanceFilters): Promise<AttendanceRecord[]> {
  const { data } = await api.get<AttendanceRecord[]>('/hr/attendance', { params: filters });
  return data;
}

export async function getTodayAttendance(branchId?: string): Promise<TodayAttendance[]> {
  const { data } = await api.get<TodayAttendance[]>('/hr/attendance/today', {
    params: branchId ? { branchId } : {},
  });
  return data;
}

export async function checkin(employeeId: string, password: string): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>('/hr/attendance/checkin', { employeeId, password });
  return data;
}

export async function checkout(employeeId: string, password: string): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>('/hr/attendance/checkout', { employeeId, password });
  return data;
}

export async function getCorrections(params?: { branchId?: string; status?: string }): Promise<AttendanceCorrection[]> {
  const { data } = await api.get<AttendanceCorrection[]>('/hr/attendance/corrections', { params });
  return data;
}

export async function getMyCorrections(employeeId: string): Promise<AttendanceCorrection[]> {
  const { data } = await api.get<AttendanceCorrection[]>('/hr/attendance/corrections/my', {
    params: { employeeId },
  });
  return data;
}

export async function requestCorrection(payload: CorrectionPayload): Promise<AttendanceCorrection> {
  const { data } = await api.post<AttendanceCorrection>('/hr/attendance/corrections', payload);
  return data;
}

export async function reviewCorrection(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  managerId: string,
  reviewNote?: string,
): Promise<void> {
  await api.patch(`/hr/attendance/corrections/${id}/review`, { status, managerId, reviewNote });
}
