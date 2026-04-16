export type RecruitmentStatus = 'open' | 'pending_approval' | 'approved' | 'rejected' | 'closed';

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
  skillRequirements?: string;
  salaryBudget?: string;
  status: RecruitmentStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export type OfferStatus = 'none' | 'sent' | 'accepted' | 'declined';

export interface Candidate {
  candidateId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  appliedPosition: string;
  source: string;
  skills?: string;
  experience?: string;
  status: CandidateStatus;
  offerStatus?: OfferStatus;
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
  position?: string;
  skills?: string;
  experience?: string;
  requestId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateRecruitmentRequestPayload {
  position: string;
  quantity: number;
  description: string;
  skillRequirements?: string;
  salaryBudget?: string;
}

export interface CreateCandidatePayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  appliedPosition: string;
  source: string;
  skills?: string;
  experience?: string;
}

export interface PublicApplyPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  appliedPosition: string;
  source?: string;
  skills?: string;
  experience?: string;
}

export interface UpdateCandidateStatusPayload {
  status: CandidateStatus;
  employeeId?: string;
}

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Interview {
  interviewId: string;
  candidateId: string;
  candidateFullName: string;
  candidateEmail: string;
  interviewerEmployeeId: string;
  interviewerName: string;
  interviewerEmail?: string;
  scheduledAt: string;
  location: string;
  status: InterviewStatus;
  score?: number;
  feedback?: string;
  createdAt: string;
}

export interface ScheduleInterviewPayload {
  candidateId: string;
  interviewerEmployeeId: string;
  scheduledAt: string;
  location: string;
}

export interface SubmitScorePayload {
  score: number;
  feedback: string;
}
