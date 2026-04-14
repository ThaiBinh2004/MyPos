'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserPlus } from 'lucide-react';
import {
  getRecruitmentRequests, getCandidates,
  createRecruitmentRequest, updateCandidateStatus,
  closeRecruitmentRequest, createCandidate,
} from '@/services/recruitment.service';
import {
  Button, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner, Input, Pagination,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { isManager } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';
import type { RecruitmentStatus, CandidateStatus } from '@/types';

const reqStatusLabel: Record<string, { label: string; variant: 'success' | 'info' | 'default' | 'danger' }> = {
  open: { label: 'Đang mở', variant: 'success' },
  in_progress: { label: 'Đang tuyển', variant: 'info' },
  closed: { label: 'Đã đóng', variant: 'default' },
  cancelled: { label: 'Đã huỷ', variant: 'danger' },
};

const candidateStatusLabel: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  new: { label: 'Mới', variant: 'default' },
  screening: { label: 'Sàng lọc', variant: 'info' },
  interview: { label: 'Phỏng vấn', variant: 'warning' },
  offer: { label: 'Offer', variant: 'info' },
  hired: { label: 'Đã tuyển', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
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
  { value: 'in_progress', label: 'Đang tuyển' },
  { value: 'closed', label: 'Đã đóng' },
  { value: 'cancelled', label: 'Đã huỷ' },
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
  const manager = isManager(user?.role ?? '');
  const [tab, setTab] = useState<'requests' | 'candidates'>('requests');
  const [reqPage, setReqPage] = useState(1);
  const [candPage, setCandPage] = useState(1);
  const [reqStatus, setReqStatus] = useState('');
  const [candStatus, setCandStatus] = useState('');

  // Form tạo yêu cầu
  const [openReqForm, setOpenReqForm] = useState(false);
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');

  // Form thêm ứng viên
  const [openCandForm, setOpenCandForm] = useState(false);
  const [candFullName, setCandFullName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candPosition, setCandPosition] = useState('');
  const [candSource, setCandSource] = useState('');

  const { data: requests, isLoading: loadingReqs } = useQuery({
    queryKey: ['recruitment', reqPage, reqStatus],
    queryFn: () => getRecruitmentRequests({ page: reqPage, pageSize: 20, ...(reqStatus && { status: reqStatus as RecruitmentStatus }) }),
    enabled: tab === 'requests',
  });

  const { data: candidates, isLoading: loadingCands } = useQuery({
    queryKey: ['candidates', candPage, candStatus],
    queryFn: () => getCandidates({ page: candPage, pageSize: 20, ...(candStatus && { status: candStatus as CandidateStatus }) }),
    enabled: tab === 'candidates',
  });

  const createReq = useMutation({
    mutationFn: () => createRecruitmentRequest({ position, quantity: Number(quantity), description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruitment'] });
      setOpenReqForm(false);
      setPosition(''); setQuantity('1'); setDescription('');
    },
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
      fullName: candFullName,
      email: candEmail,
      phoneNumber: candPhone,
      appliedPosition: candPosition,
      source: candSource,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      setOpenCandForm(false);
      setCandFullName(''); setCandEmail(''); setCandPhone(''); setCandPosition(''); setCandSource('');
    },
  });

  return (
    <div className="space-y-4">
      {/* Tab bar + action button */}
      <div className="flex items-center justify-between border-b border-gray-100">
        <div className="flex">
          {(['requests', 'candidates'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'requests' ? 'Yêu cầu tuyển dụng' : 'Ứng viên'}
            </button>
          ))}
        </div>
        {manager && (
          tab === 'requests' ? (
            <Button size="sm" onClick={() => setOpenReqForm(true)}>
              <Plus size={14} /> Tạo yêu cầu
            </Button>
          ) : (
            <Button size="sm" onClick={() => setOpenCandForm(true)}>
              <UserPlus size={14} /> Thêm ứng viên
            </Button>
          )
        )}
      </div>

      {/* Tab: Yêu cầu */}
      {tab === 'requests' && (
        <>
          <div className="flex gap-3">
            <Select
              options={REQ_STATUS_OPTIONS}
              value={reqStatus}
              onChange={(e) => { setReqStatus(e.target.value); setReqPage(1); }}
              className="w-44"
            />
          </div>

          {loadingReqs ? <PageSpinner /> : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
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
                      <TableTd colSpan={6} className="text-center py-8 text-gray-400">Không có dữ liệu</TableTd>
                    </TableRow>
                  )}
                  {requests?.data.map((r) => {
                    const status = reqStatusLabel[r.status?.toLowerCase()] ?? { label: r.status, variant: 'default' as const };
                    return (
                      <TableRow key={r.requestId}>
                        <TableTd className="font-medium">{r.position}</TableTd>
                        <TableTd>{r.quantity}</TableTd>
                        <TableTd>{r.createdByName}</TableTd>
                        <TableTd>{formatDate(r.createdAt)}</TableTd>
                        <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                        <TableTd>
                          {manager && (r.status?.toLowerCase() === 'open' || r.status?.toLowerCase() === 'in_progress') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => closeReq.mutate(r.requestId)}
                              loading={closeReq.isPending}
                            >
                              Đóng
                            </Button>
                          )}
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
          <div className="flex gap-3">
            <Select
              options={CAND_STATUS_OPTIONS}
              value={candStatus}
              onChange={(e) => { setCandStatus(e.target.value); setCandPage(1); }}
              className="w-44"
            />
          </div>

          {loadingCands ? <PageSpinner /> : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
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
                      <TableTd colSpan={7} className="text-center py-8 text-gray-400">Không có dữ liệu</TableTd>
                    </TableRow>
                  )}
                  {candidates?.data.map((c) => {
                    const status = candidateStatusLabel[c.status?.toLowerCase()] ?? { label: c.status, variant: 'default' as const };
                    const next = nextStatus[c.status?.toLowerCase()];
                    return (
                      <TableRow key={c.candidateId}>
                        <TableTd>
                          <p className="font-medium">{c.fullName}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </TableTd>
                        <TableTd>{c.appliedPosition}</TableTd>
                        <TableTd>{c.phoneNumber ?? '—'}</TableTd>
                        <TableTd>{c.source}</TableTd>
                        <TableTd>{formatDate(c.createdAt)}</TableTd>
                        <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                        <TableTd>
                          <div className="flex gap-1.5">
                            {next && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus.mutate({ id: c.candidateId, status: next })}
                                loading={updateStatus.isPending}
                              >
                                {candidateStatusLabel[next].label}
                              </Button>
                            )}
                            {c.status?.toLowerCase() !== 'rejected' && c.status?.toLowerCase() !== 'hired' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => updateStatus.mutate({ id: c.candidateId, status: 'rejected' })}
                              >
                                Từ chối
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Mô tả</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Yêu cầu công việc, kinh nghiệm..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
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
          <Input label="Nguồn" placeholder="VD: Facebook, Giới thiệu..." value={candSource} onChange={(e) => setCandSource(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCandForm(false)}>Huỷ</Button>
            <Button onClick={() => addCandidate.mutate()} loading={addCandidate.isPending}>Thêm</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
