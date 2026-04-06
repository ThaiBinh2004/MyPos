export type RecruitmentStatus = 'open' | 'in_progress' | 'closed' | 'cancelled';

export type CandidateStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface RecruitmentRequest {
  requestId: string;
  position: string;
  quantity: number;
  description: string;
  status: RecruitmentStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface Candidate {
  candidateId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  appliedPosition: string;
  source: string;
  status: CandidateStatus;
  employeeId?: string;
  createdAt: string;
}

export interface RecruitmentFilters {
  search?: string;
  status?: RecruitmentStatus;
  page?: number;
  pageSize?: number;
}

export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus;
  requestId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateRecruitmentRequestPayload {
  position: string;
  quantity: number;
  description: string;
}

export interface CreateCandidatePayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  appliedPosition: string;
  source: string;
}

export interface UpdateCandidateStatusPayload {
  status: CandidateStatus;
  employeeId?: string;
}
