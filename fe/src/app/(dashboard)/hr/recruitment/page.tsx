'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserPlus, CalendarPlus, Star } from 'lucide-react';
import { getEmployees } from '@/services/employee.service';
import {
  getRecruitmentRequests, getCandidates,
  createRecruitmentRequest, updateCandidateStatus,
  closeRecruitmentRequest, createCandidate,
  submitForApproval, approveRecruitmentRequest,
  rejectRecruitmentRequest, convertCandidateToEmployee,
  sendOffer, getBranches,
} from '@/services/recruitment.service';
import {
  getInterviewsByCandidate, scheduleInterview, submitScore, cancelInterview,
} from '@/services/interview.service';
import {
  Button, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner, Input, Pagination,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { isAdmin, isBranchManager, isHR } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';
import type { RecruitmentStatus, CandidateStatus, RecruitmentRequest, Candidate, Interview } from '@/types';

const reqStatusLabel: Record<string, { label: string; variant: 'success' | 'info' | 'default' | 'danger' | 'warning' | 'error' }> = {
  open:             { label: 'Đang mở',       variant: 'success' },
  pending_approval: { label: 'Chờ duyệt',     variant: 'warning' },
  approved:         { label: 'Đã duyệt',      variant: 'info' },
  rejected:         { label: 'Từ chối',        variant: 'error' },
  closed:           { label: 'Đã đóng',        variant: 'default' },
};

const candidateStatusLabel: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  new:       { label: 'Mới',        variant: 'default' },
  screening: { label: 'Sàng lọc',  variant: 'info' },
  interview: { label: 'Phỏng vấn', variant: 'warning' },
  offer:     { label: 'Offer',      variant: 'info' },
  hired:     { label: 'Đã tuyển',  variant: 'success' },
  rejected:  { label: 'Từ chối',   variant: 'danger' },
};

const offerStatusLabel: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'danger' }> = {
  none:     { label: 'Chưa gửi',    variant: 'default' },
  sent:     { label: 'Đã gửi',      variant: 'info' },
  accepted: { label: 'Chấp nhận',   variant: 'success' },
  declined: { label: 'Từ chối',     variant: 'danger' },
};

const nextStatus: Partial<Record<string, CandidateStatus>> = {
  new: 'screening',
  screening: 'interview',
  interview: 'offer',
  offer: 'hired',
};

const REQ_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'open', label: 'Đang mở' },
  { value: 'pending_approval', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'closed', label: 'Đã đóng' },
];

const CAND_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'new', label: 'Mới' },
  { value: 'screening', label: 'Sàng lọc' },
  { value: 'interview', label: 'Phỏng vấn' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Đã tuyển' },
  { value: 'rejected', label: 'Từ chối' },
];

export default function RecruitmentPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const admin = isAdmin(user?.role ?? '');
  const branchManager = isBranchManager(user?.role ?? '');
  const hr = isHR(user?.role ?? '');

  useEffect(() => {
    if (hr || branchManager) setTab('candidates');
  }, [hr, branchManager]);
  const [tab, setTab] = useState<'requests' | 'candidates'>('requests');
  const [reqPage, setReqPage] = useState(1);
  const [candPage, setCandPage] = useState(1);
  const [reqStatus, setReqStatus] = useState('');
  const [candStatus, setCandStatus] = useState('');
  const [candSearch, setCandSearch] = useState('');
  const [candPositionFilter, setCandPositionFilter] = useState('');
  const [candSkillsFilter, setCandSkillsFilter] = useState('');
  const [candExpFilter, setCandExpFilter] = useState('');

  // Form tạo yêu cầu
  const [openReqForm, setOpenReqForm] = useState(false);
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [skillRequirements, setSkillRequirements] = useState('');
  const [salaryBudget, setSalaryBudget] = useState('');

  // Form thêm ứng viên
  const [openCandForm, setOpenCandForm] = useState(false);
  const [candFullName, setCandFullName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candPosition, setCandPosition] = useState('');
  const [candSource, setCandSource] = useState('');
  const [candSkills, setCandSkills] = useState('');
  const [candExperience, setCandExperience] = useState('');

  // Chi tiết ứng viên
  const [detailCand, setDetailCand] = useState<Candidate | null>(null);

  // Lên lịch phỏng vấn
  const [schedCand, setSchedCand] = useState<Candidate | null>(null);
  const [schedInterviewer, setSchedInterviewer] = useState('');
  const [schedDateTime, setSchedDateTime] = useState('');
  const [schedLocation, setSchedLocation] = useState('');

  // Nhập điểm phỏng vấn
  const [scoreInterview, setScoreInterview] = useState<Interview | null>(null);
  const [scoreValue, setScoreValue] = useState('');
  const [scoreFeedback, setScoreFeedback] = useState('');

  // Xem chi tiết yêu cầu
  const [detailReq, setDetailReq] = useState<RecruitmentRequest | null>(null);

  // Form convert hired → nhân viên (fallback thủ công)
  const [convertCandId, setConvertCandId] = useState<string | null>(null);
  const [convertName, setConvertName] = useState('');
  const [convertBranchId, setConvertBranchId] = useState('');
  const [convertDob, setConvertDob] = useState('');
  const [convertIdCard, setConvertIdCard] = useState('');
  const [convertBank, setConvertBank] = useState('');

  // Modal gửi thư mời nhận việc
  const [offerCand, setOfferCand] = useState<Candidate | null>(null);
  const [offerBranchId, setOfferBranchId] = useState('');
  const [offerSalary, setOfferSalary] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => getEmployees({}),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const { data: detailInterviews, isLoading: loadingInterviews } = useQuery({
    queryKey: ['interviews', detailCand?.candidateId],
    queryFn: () => getInterviewsByCandidate(detailCand!.candidateId),
    enabled: !!detailCand,
  });

  const scheduleMutation = useMutation({
    mutationFn: () => scheduleInterview({
      candidateId: schedCand!.candidateId,
      interviewerEmployeeId: schedInterviewer,
      scheduledAt: schedDateTime.length === 16 ? schedDateTime + ':00' : schedDateTime,
      location: schedLocation,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      setSchedCand(null);
      setSchedInterviewer(''); setSchedDateTime(''); setSchedLocation('');
    },
  });

  const scoreMutation = useMutation({
    mutationFn: () => submitScore(scoreInterview!.interviewId, {
      score: Number(scoreValue),
      feedback: scoreFeedback,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      setScoreInterview(null);
      setScoreValue(''); setScoreFeedback('');
    },
  });

  const cancelInterviewMutation = useMutation({
    mutationFn: (id: string) => cancelInterview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });

  const { data: requests, isLoading: loadingReqs } = useQuery({
    queryKey: ['recruitment', reqPage, reqStatus],
    queryFn: () => getRecruitmentRequests({ page: reqPage, pageSize: 20, ...(reqStatus && { status: reqStatus as RecruitmentStatus }) }),
    enabled: tab === 'requests',
  });

  const { data: candidates, isLoading: loadingCands } = useQuery({
    queryKey: ['candidates', candPage, candStatus, candSearch, candPositionFilter, candSkillsFilter, candExpFilter],
    queryFn: () => getCandidates({
      page: candPage, pageSize: 20,
      ...(candStatus && { status: candStatus as CandidateStatus }),
      ...(candSearch && { search: candSearch }),
      ...(candPositionFilter && { position: candPositionFilter }),
      ...(candSkillsFilter && { skills: candSkillsFilter }),
      ...(candExpFilter && { experience: candExpFilter }),
    }),
    enabled: tab === 'candidates',
    refetchInterval: tab === 'candidates' ? 10000 : false,
  });

  const createReq = useMutation({
    mutationFn: () => createRecruitmentRequest({ position, quantity: Number(quantity), description, skillRequirements, salaryBudget }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruitment'] });
      setOpenReqForm(false);
      setPosition(''); setQuantity('1'); setDescription(''); setSkillRequirements(''); setSalaryBudget('');
    },
  });

  const submitApproval = useMutation({
    mutationFn: (id: string) => submitForApproval(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruitment'] }),
  });

  const approveReq = useMutation({
    mutationFn: (id: string) => approveRecruitmentRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruitment'] }),
  });

  const rejectReq = useMutation({
    mutationFn: (id: string) => rejectRecruitmentRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruitment'] }),
  });

  const closeReq = useMutation({
    mutationFn: (id: string) => closeRecruitmentRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruitment'] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      updateCandidateStatus(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidates'] }),
  });

  const addCandidate = useMutation({
    mutationFn: () => createCandidate({
      fullName: candFullName, email: candEmail, phoneNumber: candPhone,
      appliedPosition: candPosition, source: candSource,
      skills: candSkills, experience: candExperience,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      setOpenCandForm(false);
      setCandFullName(''); setCandEmail(''); setCandPhone(''); setCandPosition(''); setCandSource('');
      setCandSkills(''); setCandExperience('');
    },
  });

  const sendOfferMutation = useMutation({
    mutationFn: () => sendOffer(offerCand!.candidateId, { branchId: offerBranchId, salary: offerSalary }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      setOfferCand(null);
      setOfferBranchId(''); setOfferSalary('');
    },
  });

  const convertMutation = useMutation({
    mutationFn: () => convertCandidateToEmployee(convertCandId!, {
      branchId: convertBranchId,
      dateOfBirth: convertDob,
      idCard: convertIdCard,
      bankAccount: convertBank,
    }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      setConvertCandId(null);
      alert(`Đã tạo nhân viên thành công! Mã nhân viên: ${res.employeeId}`);
    },
  });

  function openConvertModal(cand: { candidateId: string; fullName: string }) {
    setConvertCandId(cand.candidateId);
    setConvertName(cand.fullName);
    setConvertBranchId(''); setConvertDob(''); setConvertIdCard(''); setConvertBank('');
  }

  return (
    <div className="space-y-4">
      {/* Tab bar + action button */}
      <div className="flex items-center justify-between border-b border-gray-100">
        <div className="flex">
          {([...(hr ? [] : ['requests']), ...(hr || branchManager ? ['candidates'] : [])] as ('requests' | 'candidates')[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'requests' ? 'Yêu cầu tuyển dụng' : 'Ứng viên'}
            </button>
          ))}
        </div>
        {branchManager && tab === 'requests' && (
          <Button size="sm" onClick={() => setOpenReqForm(true)}>
            <Plus size={14} /> Tạo yêu cầu
          </Button>
        )}
      </div>

      {/* Tab: Yêu cầu */}
      {tab === 'requests' && (
        <>
          <div className="flex gap-3">
            <Select options={REQ_STATUS_OPTIONS} value={reqStatus}
              onChange={(e) => { setReqStatus(e.target.value); setReqPage(1); }} className="w-44" />
          </div>

          {loadingReqs ? <PageSpinner /> : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh className="w-10">STT</TableTh>
                    <TableTh>Vị trí</TableTh>
                    <TableTh>Số lượng</TableTh>
                    <TableTh>Người tạo</TableTh>
                    <TableTh>Ngày tạo</TableTh>
                    <TableTh>Trạng thái</TableTh>
                    <TableTh />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests?.data.length === 0 && (
                    <TableRow>
                      <TableTd colSpan={7} className="text-center py-8 text-gray-400">Không có dữ liệu</TableTd>
                    </TableRow>
                  )}
                  {requests?.data.map((r, idx) => {
                    const status = reqStatusLabel[r.status?.toLowerCase()] ?? { label: r.status, variant: 'default' as const };
                    const s = r.status?.toLowerCase();
                    return (
                      <TableRow key={r.requestId}>
                        <TableTd className="text-gray-400 text-xs">{(reqPage - 1) * 20 + idx + 1}</TableTd>
                        <TableTd className="font-medium">{r.position}</TableTd>
                        <TableTd>{r.quantity}</TableTd>
                        <TableTd>{r.createdByName}</TableTd>
                        <TableTd>{formatDate(r.createdAt)}</TableTd>
                        <TableTd><Badge variant={status.variant as any}>{status.label}</Badge></TableTd>
                        <TableTd>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => setDetailReq(r)}>Xem</Button>
                            {/* Branch manager: gửi duyệt */}
                            {branchManager && s === 'open' && (
                              <Button size="sm" variant="outline"
                                onClick={() => submitApproval.mutate(r.requestId)}
                                loading={submitApproval.isPending}>
                                Gửi duyệt
                              </Button>
                            )}
                            {/* Admin/Director: duyệt hoặc từ chối */}
                            {admin && s === 'pending_approval' && (
                              <>
                                <Button size="sm"
                                  onClick={() => approveReq.mutate(r.requestId)}
                                  loading={approveReq.isPending}>
                                  Duyệt
                                </Button>
                                <Button size="sm" variant="danger"
                                  onClick={() => rejectReq.mutate(r.requestId)}
                                  loading={rejectReq.isPending}>
                                  Từ chối
                                </Button>
                              </>
                            )}
                            {/* Branch manager: đóng yêu cầu đã duyệt */}
                            {branchManager && s === 'approved' && (
                              <Button size="sm" variant="ghost"
                                onClick={() => closeReq.mutate(r.requestId)}
                                loading={closeReq.isPending}>
                                Đóng
                              </Button>
                            )}
                          </div>
                        </TableTd>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {requests && <Pagination page={reqPage} total={requests.total} pageSize={20} onChange={setReqPage} />}
            </>
          )}
        </>
      )}

      {/* Tab: Ứng viên */}
      {tab === 'candidates' && (
        <>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Tìm tên, email..."
              value={candSearch}
              onChange={(e) => { setCandSearch(e.target.value); setCandPage(1); }}
              className="w-44"
            />
            <Input
              placeholder="Vị trí ứng tuyển..."
              value={candPositionFilter}
              onChange={(e) => { setCandPositionFilter(e.target.value); setCandPage(1); }}
              className="w-44"
            />
            <Input
              placeholder="Kỹ năng..."
              value={candSkillsFilter}
              onChange={(e) => { setCandSkillsFilter(e.target.value); setCandPage(1); }}
              className="w-36"
            />
            <Input
              placeholder="Kinh nghiệm..."
              value={candExpFilter}
              onChange={(e) => { setCandExpFilter(e.target.value); setCandPage(1); }}
              className="w-36"
            />
            <Select options={CAND_STATUS_OPTIONS} value={candStatus}
              onChange={(e) => { setCandStatus(e.target.value); setCandPage(1); }} className="w-40" />
          </div>

          {loadingCands ? <PageSpinner /> : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh className="w-10">STT</TableTh>
                    <TableTh>Ứng viên</TableTh>
                    <TableTh>Vị trí ứng tuyển</TableTh>
                    <TableTh>SĐT</TableTh>
                    <TableTh>Nguồn</TableTh>
                    <TableTh>Ngày nộp</TableTh>
                    <TableTh>Trạng thái</TableTh>
                    <TableTh />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates?.data.length === 0 && (
                    <TableRow>
                      <TableTd colSpan={8} className="text-center py-8 text-gray-400">Không có dữ liệu</TableTd>
                    </TableRow>
                  )}
                  {candidates?.data.map((c, idx) => {
                    const status = candidateStatusLabel[c.status?.toLowerCase()] ?? { label: c.status, variant: 'default' as const };
                    const next = nextStatus[c.status?.toLowerCase()];
                    const s = c.status?.toLowerCase();
                    return (
                      <TableRow key={c.candidateId}>
                        <TableTd className="text-gray-400 text-xs">{(candPage - 1) * 20 + idx + 1}</TableTd>
                        <TableTd>
                          <p className="font-medium">{c.fullName}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </TableTd>
                        <TableTd>{c.appliedPosition}</TableTd>
                        <TableTd>{c.phoneNumber ?? '—'}</TableTd>
                        <TableTd>{c.source}</TableTd>
                        <TableTd>{formatDate(c.createdAt)}</TableTd>
                        <TableTd>
                          <div className="flex flex-col gap-1">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            {s === 'offer' && c.offerStatus && c.offerStatus !== 'none' && (
                              <Badge variant={offerStatusLabel[c.offerStatus]?.variant ?? 'default'} className="text-xs">
                                {offerStatusLabel[c.offerStatus]?.label}
                              </Badge>
                            )}
                          </div>
                        </TableTd>
                        <TableTd>
                          <div className="flex gap-1.5 flex-wrap">
                            <Button size="sm" variant="ghost" onClick={() => setDetailCand(c)}>Xem</Button>
                            {hr && s === 'interview' && (
                              <Button size="sm" variant="outline"
                                onClick={() => setSchedCand(c)}>
                                <CalendarPlus size={13} /> Lên lịch
                              </Button>
                            )}
                            {hr && s === 'offer' && (c.offerStatus === 'none' || c.offerStatus === 'declined' || !c.offerStatus) && (
                              <Button size="sm" variant="outline"
                                onClick={() => { setOfferCand(c); setOfferBranchId(''); }}>
                                {c.offerStatus === 'declined' ? 'Gửi lại' : 'Gửi thư mời'}
                              </Button>
                            )}
                            {hr && next && s !== 'offer' && (
                              <Button size="sm"
                                onClick={() => updateStatus.mutate({ id: c.candidateId, status: next })}
                                loading={updateStatus.isPending}>
                                {candidateStatusLabel[next].label}
                              </Button>
                            )}
                            {hr && s !== 'rejected' && s !== 'hired' && (
                              <Button size="sm" variant="danger"
                                onClick={() => updateStatus.mutate({ id: c.candidateId, status: 'rejected' })}>
                                Từ chối
                              </Button>
                            )}
                            {hr && s === 'hired' && !c.employeeId && (
                              <Button size="sm" variant="outline"
                                onClick={() => openConvertModal(c)}>
                                Tạo nhân viên
                              </Button>
                            )}
                          </div>
                        </TableTd>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {candidates && <Pagination page={candPage} total={candidates.total} pageSize={20} onChange={setCandPage} />}
            </>
          )}
        </>
      )}

      {/* Modal: Tạo yêu cầu */}
      <Modal open={openReqForm} onClose={() => setOpenReqForm(false)} title="Tạo yêu cầu tuyển dụng">
        <div className="space-y-4">
          <Input label="Vị trí tuyển" placeholder="VD: Nhân viên bán hàng" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Input label="Số lượng" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input label="Ngân sách lương" placeholder="VD: 6.000.000 - 8.000.000 VNĐ" value={salaryBudget} onChange={(e) => setSalaryBudget(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Mô tả công việc</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả công việc cần làm..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Yêu cầu kỹ năng</label>
            <textarea rows={2} value={skillRequirements} onChange={(e) => setSkillRequirements(e.target.value)}
              placeholder="VD: Kinh nghiệm bán hàng, giao tiếp tốt..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenReqForm(false)}>Huỷ</Button>
            <Button onClick={() => createReq.mutate()} loading={createReq.isPending}>Tạo</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Thêm ứng viên */}
      <Modal open={openCandForm} onClose={() => setOpenCandForm(false)} title="Thêm ứng viên">
        <div className="space-y-4">
          <Input label="Họ tên *" placeholder="Nguyễn Văn A" value={candFullName} onChange={(e) => setCandFullName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email *" type="email" placeholder="email@gmail.com" value={candEmail} onChange={(e) => setCandEmail(e.target.value)} />
            <Input label="Số điện thoại" placeholder="0901234567" value={candPhone} onChange={(e) => setCandPhone(e.target.value)} />
          </div>
          <Input label="Vị trí ứng tuyển *" placeholder="VD: Nhân viên bán hàng" value={candPosition} onChange={(e) => setCandPosition(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nguồn" placeholder="VD: Facebook, Giới thiệu..." value={candSource} onChange={(e) => setCandSource(e.target.value)} />
            <Input label="Kinh nghiệm" placeholder="VD: 2 năm bán lẻ..." value={candExperience} onChange={(e) => setCandExperience(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Kỹ năng</label>
            <textarea rows={2} value={candSkills} onChange={(e) => setCandSkills(e.target.value)}
              placeholder="VD: Giao tiếp tốt, tư vấn khách hàng..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCandForm(false)}>Huỷ</Button>
            <Button onClick={() => addCandidate.mutate()} loading={addCandidate.isPending}>Thêm</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Chi tiết ứng viên */}
      <Modal open={!!detailCand} onClose={() => setDetailCand(null)} title="Chi tiết ứng viên">
        {detailCand && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Họ tên</p>
                <p className="text-sm font-semibold text-gray-800">{detailCand.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Trạng thái</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={(candidateStatusLabel[detailCand.status?.toLowerCase()]?.variant ?? 'default') as any}>
                    {candidateStatusLabel[detailCand.status?.toLowerCase()]?.label ?? detailCand.status}
                  </Badge>
                  {detailCand.offerStatus && detailCand.offerStatus !== 'none' && (
                    <Badge variant={offerStatusLabel[detailCand.offerStatus]?.variant ?? 'default'}>
                      Thư mời: {offerStatusLabel[detailCand.offerStatus]?.label}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                <p className="text-sm text-gray-800">{detailCand.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Số điện thoại</p>
                <p className="text-sm text-gray-800">{detailCand.phoneNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Vị trí ứng tuyển</p>
                <p className="text-sm text-gray-800">{detailCand.appliedPosition}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Nguồn</p>
                <p className="text-sm text-gray-800">{detailCand.source || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Kinh nghiệm</p>
                <p className="text-sm text-gray-800">{detailCand.experience || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Ngày nộp</p>
                <p className="text-sm text-gray-800">{formatDate(detailCand.createdAt)}</p>
              </div>
            </div>
            {detailCand.skills && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Kỹ năng</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100">{detailCand.skills}</p>
              </div>
            )}

            {/* Lịch sử phỏng vấn */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Lịch phỏng vấn</p>
              {loadingInterviews ? (
                <p className="text-xs text-gray-400">Đang tải...</p>
              ) : detailInterviews?.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Chưa có lịch phỏng vấn.</p>
              ) : (
                <div className="space-y-2">
                  {detailInterviews?.map((iv) => (
                    <div key={iv.interviewId} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{new Date(iv.scheduledAt).toLocaleString('vi-VN')}</span>
                        <Badge variant={iv.status === 'completed' ? 'success' : iv.status === 'cancelled' ? 'default' : 'info'} className="text-xs">
                          {iv.status === 'completed' ? 'Hoàn thành' : iv.status === 'cancelled' ? 'Đã huỷ' : 'Đã lên lịch'}
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-xs">Người PV: {iv.interviewerName} · {iv.location}</p>
                      {iv.score != null && (
                        <p className="text-xs mt-1">
                          <span className="font-medium text-indigo-600">Điểm: {iv.score}/10</span>
                          {iv.feedback && <span className="text-gray-500"> — {iv.feedback}</span>}
                        </p>
                      )}
                      {iv.status === 'scheduled' && (
                        <div className="flex gap-1.5 mt-2">
                          {user?.employeeId === iv.interviewerEmployeeId && (
                            <Button size="sm" variant="outline"
                              onClick={() => { setScoreInterview(iv); setScoreValue(''); setScoreFeedback(''); }}>
                              <Star size={12} /> Nhập điểm
                            </Button>
                          )}
                          {hr && (
                            <Button size="sm" variant="ghost"
                              onClick={() => cancelInterviewMutation.mutate(iv.interviewId)}
                              loading={cancelInterviewMutation.isPending}>
                              Huỷ
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {hr && detailCand.status === 'interview' && (
                <Button size="sm" variant="outline"
                  onClick={() => { setSchedCand(detailCand); setDetailCand(null); }}>
                  <CalendarPlus size={13} /> Lên lịch PV
                </Button>
              )}
              {hr && detailCand.status === 'offer' && (detailCand.offerStatus === 'none' || detailCand.offerStatus === 'declined' || !detailCand.offerStatus) && (
                <Button size="sm" variant="outline"
                  onClick={() => { setOfferCand(detailCand); setDetailCand(null); setOfferBranchId(''); }}>
                  {detailCand.offerStatus === 'declined' ? 'Gửi lại thư mời' : 'Gửi thư mời nhận việc'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDetailCand(null)}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Chi tiết yêu cầu tuyển dụng */}
      <Modal open={!!detailReq} onClose={() => setDetailReq(null)} title="Chi tiết yêu cầu tuyển dụng">
        {detailReq && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Mã yêu cầu</p>
                <p className="text-sm font-semibold text-gray-800">{detailReq.requestId}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Trạng thái</p>
                <Badge variant={(reqStatusLabel[detailReq.status?.toLowerCase()]?.variant ?? 'default') as any}>
                  {reqStatusLabel[detailReq.status?.toLowerCase()]?.label ?? detailReq.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Vị trí tuyển</p>
                <p className="text-sm text-gray-800">{detailReq.position}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Số lượng</p>
                <p className="text-sm text-gray-800">{detailReq.quantity}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Ngân sách lương</p>
                <p className="text-sm text-gray-800">{detailReq.salaryBudget || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">Người tạo</p>
                <p className="text-sm text-gray-800">{detailReq.createdByName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-gray-500 mb-0.5">Ngày tạo</p>
                <p className="text-sm text-gray-800">{formatDate(detailReq.createdAt)}</p>
              </div>
            </div>
            {detailReq.description && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Mô tả công việc</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100">{detailReq.description}</p>
              </div>
            )}
            {detailReq.skillRequirements && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Yêu cầu kỹ năng</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 border border-gray-100">{detailReq.skillRequirements}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              {admin && detailReq.status?.toLowerCase() === 'pending_approval' && (
                <>
                  <Button variant="danger"
                    onClick={() => { rejectReq.mutate(detailReq.requestId); setDetailReq(null); }}
                    loading={rejectReq.isPending}>
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => { approveReq.mutate(detailReq.requestId); setDetailReq(null); }}
                    loading={approveReq.isPending}>
                    Duyệt
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailReq(null)}>Đóng</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Lên lịch phỏng vấn */}
      <Modal open={!!schedCand} onClose={() => setSchedCand(null)}
        title={`Lên lịch phỏng vấn — ${schedCand?.fullName}`}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Người phỏng vấn *</label>
            <select value={schedInterviewer} onChange={(e) => setSchedInterviewer(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
              <option value="">-- Chọn nhân viên --</option>
              {employees?.data.filter((emp: any) =>
                ['quản lý', 'giám đốc'].some(k => emp.position?.toLowerCase().includes(k))
              ).map((emp: any) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.fullName} — {emp.position}
                </option>
              ))}
            </select>
          </div>
          <Input label="Thời gian *" type="datetime-local" value={schedDateTime}
            onChange={(e) => setSchedDateTime(e.target.value)} />
          <Input label="Địa điểm / Link Meet" placeholder="VD: Phòng họp tầng 2 / meet.google.com/..."
            value={schedLocation} onChange={(e) => setSchedLocation(e.target.value)} />
          <p className="text-xs text-gray-400">Hệ thống sẽ tự gửi email thông báo cho ứng viên và người phỏng vấn.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSchedCand(null)}>Huỷ</Button>
            <Button onClick={() => scheduleMutation.mutate()} loading={scheduleMutation.isPending}>
              Lên lịch & Gửi email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Nhập điểm phỏng vấn */}
      <Modal open={!!scoreInterview} onClose={() => setScoreInterview(null)}
        title="Nhập kết quả phỏng vấn">
        {scoreInterview && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Ứng viên: <strong>{scoreInterview.candidateFullName}</strong> ·
              Phỏng vấn: <strong>{new Date(scoreInterview.scheduledAt).toLocaleString('vi-VN')}</strong>
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Điểm đánh giá (1–10) *</label>
              <input type="number" min={1} max={10} value={scoreValue}
                onChange={(e) => setScoreValue(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-24" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Nhận xét</label>
              <textarea rows={3} value={scoreFeedback} onChange={(e) => setScoreFeedback(e.target.value)}
                placeholder="Nhận xét về ứng viên sau buổi phỏng vấn..."
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScoreInterview(null)}>Huỷ</Button>
              <Button onClick={() => scoreMutation.mutate()} loading={scoreMutation.isPending}>Lưu đánh giá</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Gửi thư mời nhận việc */}
      <Modal open={!!offerCand} onClose={() => setOfferCand(null)}
        title={`Gửi thư mời nhận việc — ${offerCand?.fullName}`}>
        <div className="space-y-4">
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-sm text-indigo-700">
            <p className="font-medium mb-1">{offerCand?.fullName}</p>
            <p className="text-xs text-indigo-500">{offerCand?.appliedPosition} · {offerCand?.email}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Chi nhánh *</label>
            <select value={offerBranchId} onChange={(e) => setOfferBranchId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
              <option value="">-- Chọn chi nhánh --</option>
              {branches?.map((b) => (
                <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
              ))}
            </select>
          </div>
          <Input label="Mức lương đề xuất" placeholder="VD: 8.000.000 VNĐ (để trống nếu chưa xác định)" value={offerSalary}
            onChange={(e) => setOfferSalary(e.target.value)} />
          <p className="text-xs text-gray-400">
            Ứng viên nhận email → chấp nhận → tự điền ngày sinh, CMND/CCCD, tài khoản ngân hàng → hệ thống tạo hồ sơ nhân viên tự động.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOfferCand(null)}>Huỷ</Button>
            <Button onClick={() => sendOfferMutation.mutate()} loading={sendOfferMutation.isPending}
              disabled={!offerBranchId || !offerSalary}>
              Gửi thư mời
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Tạo nhân viên từ ứng viên */}
      <Modal open={!!convertCandId} onClose={() => setConvertCandId(null)} title={`Tạo nhân viên từ ứng viên: ${convertName}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Điền thêm thông tin để tạo hồ sơ nhân viên.</p>
          <Input label="Mã chi nhánh *" placeholder="VD: BR001" value={convertBranchId} onChange={(e) => setConvertBranchId(e.target.value)} />
          <Input label="Ngày sinh *" type="date" value={convertDob} onChange={(e) => setConvertDob(e.target.value)} />
          <Input label="Số CMND/CCCD *" placeholder="012345678901" value={convertIdCard} onChange={(e) => setConvertIdCard(e.target.value)} />
          <Input label="Số tài khoản ngân hàng" placeholder="0011234567890" value={convertBank} onChange={(e) => setConvertBank(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConvertCandId(null)}>Huỷ</Button>
            <Button onClick={() => convertMutation.mutate()} loading={convertMutation.isPending}>Tạo nhân viên</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
