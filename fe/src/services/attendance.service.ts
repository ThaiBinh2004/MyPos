import api from '@/lib/axios';
import type {
  AttendanceRecord,
  AttendanceFilters,
  AttendanceCorrection,
  KioskCheckinPayload,
  KioskCheckoutPayload,
  CorrectionRequestPayload,
  ReviewCorrectionPayload,
  PaginatedResponse,
} from '@/types';

export async function getAttendanceRecords(
  filters?: AttendanceFilters
): Promise<PaginatedResponse<AttendanceRecord>> {
  const { data } = await api.get<PaginatedResponse<AttendanceRecord>>('/hr/attendance', {
    params: filters,
  });
  return data;
}

export async function getAttendanceRecord(id: number): Promise<AttendanceRecord> {
  const { data } = await api.get<AttendanceRecord>(`/hr/attendance/${id}`);
  return data;
}

export async function checkin(payload: KioskCheckinPayload): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>('/hr/attendance/checkin', payload);
  return data;
}

export async function checkout(payload: KioskCheckoutPayload): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>('/hr/attendance/checkout', payload);
  return data;
}

export async function getCorrections(filters?: {
  status?: string;
  branchId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AttendanceCorrection>> {
  const { data } = await api.get<PaginatedResponse<AttendanceCorrection>>(
    '/hr/attendance/corrections',
    { params: filters }
  );
  return data;
}

export async function requestCorrection(
  payload: CorrectionRequestPayload
): Promise<AttendanceCorrection> {
  const { data } = await api.post<AttendanceCorrection>(
    '/hr/attendance/corrections',
    payload
  );
  return data;
}

export async function reviewCorrection(
  id: number,
  payload: ReviewCorrectionPayload
): Promise<AttendanceCorrection> {
  const { data } = await api.patch<AttendanceCorrection>(
    `/hr/attendance/corrections/${id}/review`,
    payload
  );
  return data;
}
