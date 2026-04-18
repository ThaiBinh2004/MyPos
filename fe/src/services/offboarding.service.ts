import api from '@/lib/axios';
import type {
  Offboarding,
  InitiateOffboardingPayload,
  ConfirmAssetReturnPayload,
  OffboardingAssetReturn,
} from '@/types';

export async function getOffboardings(branchId?: string): Promise<Offboarding[]> {
  const { data } = await api.get<Offboarding[]>('/hr/offboarding', {
    params: branchId ? { branchId } : undefined,
  });
  return data;
}

export async function getOffboarding(id: string): Promise<Offboarding> {
  const { data } = await api.get<Offboarding>(`/hr/offboarding/${id}`);
  return data;
}

export async function initiateOffboarding(payload: InitiateOffboardingPayload): Promise<Offboarding> {
  const { data } = await api.post<Offboarding>('/hr/offboarding', payload);
  return data;
}

export async function confirmAssetReturn(
  returnId: string,
  payload: ConfirmAssetReturnPayload
): Promise<OffboardingAssetReturn> {
  const { data } = await api.patch<OffboardingAssetReturn>(
    `/hr/offboarding/returns/${returnId}/confirm`,
    payload
  );
  return data;
}

export async function submitOffboardingApproval(id: string, otp: string): Promise<Offboarding> {
  const { data } = await api.post<Offboarding>(`/hr/offboarding/${id}/submit-approval`, { otp });
  return data;
}

export async function approveOffboarding(
  id: string,
  approvedByEmployeeId: string,
  directorNote?: string
): Promise<Offboarding> {
  const { data } = await api.post<Offboarding>(`/hr/offboarding/${id}/approve`, {
    approvedByEmployeeId,
    directorNote: directorNote ?? '',
  });
  return data;
}

export async function rejectOffboarding(
  id: string,
  directorNote: string
): Promise<Offboarding> {
  const { data } = await api.post<Offboarding>(`/hr/offboarding/${id}/reject`, { directorNote });
  return data;
}

export async function generateOtp(id: string, type: 'EMPLOYEE' | 'MANAGER'): Promise<{ otp: string; message: string }> {
  const { data } = await api.post(`/hr/offboarding/${id}/otp/generate`, { type });
  return data;
}

export async function employeeConfirmOffboarding(
  id: string,
  employeeId: string,
  otp: string
): Promise<Offboarding> {
  const { data } = await api.post<Offboarding>(`/hr/offboarding/${id}/employee-confirm`, { employeeId, otp });
  return data;
}

export async function getEmployeeOffboardings(employeeId: string): Promise<Offboarding[]> {
  const { data } = await api.get<Offboarding[]>(`/hr/offboarding/employee/${employeeId}`);
  return data;
}

export async function getPendingSettlement(): Promise<Offboarding[]> {
  const { data } = await api.get<Offboarding[]>('/hr/offboarding/pending-settlement');
  return data;
}

export async function settleOffboarding(
  id: string,
  settledByEmployeeId: string,
  settlementMethod: string,
  settlementNote: string
): Promise<Offboarding> {
  const { data } = await api.post<Offboarding>(`/hr/offboarding/${id}/settle`, {
    settledByEmployeeId,
    settlementMethod,
    settlementNote,
  });
  return data;
}
