import axios from 'axios';
import api from '@/lib/axios';
import type {
  RecruitmentRequest,
  RecruitmentFilters,
  CreateRecruitmentRequestPayload,
  Candidate,
  CandidateFilters,
  CreateCandidatePayload,
  UpdateCandidateStatusPayload,
  PublicApplyPayload,
  PaginatedResponse,
} from '@/types';

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export async function getRecruitmentRequests(
  filters?: RecruitmentFilters
): Promise<PaginatedResponse<RecruitmentRequest>> {
  const { data } = await api.get<PaginatedResponse<RecruitmentRequest>>(
    '/hr/recruitment',
    { params: filters }
  );
  return data;
}

export async function getRecruitmentRequest(id: string): Promise<RecruitmentRequest> {
  const { data } = await api.get<RecruitmentRequest>(`/hr/recruitment/${id}`);
  return data;
}

export async function createRecruitmentRequest(
  payload: CreateRecruitmentRequestPayload
): Promise<RecruitmentRequest> {
  const { data } = await api.post<RecruitmentRequest>('/hr/recruitment', payload);
  return data;
}

export async function closeRecruitmentRequest(id: string): Promise<RecruitmentRequest> {
  const { data } = await api.post<RecruitmentRequest>(`/hr/recruitment/${id}/close`);
  return data;
}

export async function getCandidates(
  filters?: CandidateFilters
): Promise<PaginatedResponse<Candidate>> {
  const { data } = await api.get<PaginatedResponse<Candidate>>('/hr/candidates', {
    params: filters,
  });
  return data;
}

export async function getCandidate(id: string): Promise<Candidate> {
  const { data } = await api.get<Candidate>(`/hr/candidates/${id}`);
  return data;
}

export async function createCandidate(payload: CreateCandidatePayload): Promise<Candidate> {
  const { data } = await api.post<Candidate>('/hr/candidates', payload);
  return data;
}

export async function updateCandidateStatus(
  id: string,
  payload: UpdateCandidateStatusPayload
): Promise<Candidate> {
  const { data } = await api.patch<Candidate>(`/hr/candidates/${id}/status`, payload);
  return data;
}

export async function submitForApproval(id: string): Promise<void> {
  await api.post(`/hr/recruitment/${id}/submit`);
}

export async function approveRecruitmentRequest(id: string): Promise<void> {
  await api.post(`/hr/recruitment/${id}/approve`);
}

export async function rejectRecruitmentRequest(id: string): Promise<void> {
  await api.post(`/hr/recruitment/${id}/reject`);
}

export async function applyPublic(payload: PublicApplyPayload): Promise<Candidate> {
  const { data } = await publicApi.post<Candidate>('/apply', payload);
  return data;
}

export async function convertCandidateToEmployee(
  candidateId: string,
  payload: { branchId: string; dateOfBirth: string; idCard: string; bankAccount: string }
): Promise<{ employeeId: string; message: string }> {
  const { data } = await api.post(`/hr/candidates/${candidateId}/convert`, payload);
  return data;
}

export async function sendOffer(
  candidateId: string,
  payload: { branchId: string; salary?: string }
): Promise<void> {
  await api.post(`/hr/candidates/${candidateId}/send-offer`, payload);
}

export async function getBranches(): Promise<{ branchId: string; branchName: string }[]> {
  const { data } = await api.get('/hr/branches');
  return data;
}
