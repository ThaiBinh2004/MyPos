import api from '@/lib/axios';
import type { Interview, ScheduleInterviewPayload, SubmitScorePayload } from '@/types';

export async function getInterviewsByCandidate(candidateId: string): Promise<Interview[]> {
  const { data } = await api.get<Interview[]>('/hr/interviews', { params: { candidateId } });
  return data;
}

export async function getInterviewsByEmployee(employeeId: string): Promise<Interview[]> {
  const { data } = await api.get<Interview[]>('/hr/interviews', { params: { employeeId } });
  return data;
}

export async function scheduleInterview(payload: ScheduleInterviewPayload): Promise<Interview> {
  const { data } = await api.post<Interview>('/hr/interviews', payload);
  return data;
}

export async function submitScore(interviewId: string, payload: SubmitScorePayload): Promise<void> {
  await api.patch(`/hr/interviews/${interviewId}/score`, payload);
}

export async function cancelInterview(interviewId: string): Promise<void> {
  await api.patch(`/hr/interviews/${interviewId}/cancel`);
}
