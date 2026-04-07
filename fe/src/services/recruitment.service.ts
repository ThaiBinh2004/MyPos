import api from '@/lib/axios';
import type {
  RecruitmentRequest,
  RecruitmentFilters,
  CreateRecruitmentRequestPayload,
  Candidate,
  CandidateFilters,
  CreateCandidatePayload,
  UpdateCandidateStatusPayload,
  PaginatedResponse,
} from '@/types';

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
