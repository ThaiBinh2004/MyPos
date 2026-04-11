'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import {
  getRecruitmentRequests, getCandidates,
  createRecruitmentRequest, updateCandidateStatus,
} from '@/services/recruitment.service';
import {
  Button, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner, Input,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { RecruitmentStatus, CandidateStatus } from '@/types';

const reqStatusLabel: Record<RecruitmentStatus, { label: string; variant: 'success' | 'info' | 'default' | 'danger' }> = {
  open: { label: 'Đang mở', variant: 'success' },
  in_progress: { label: 'Đang tuyển', variant: 'info' },
  closed: { label: 'Đã đóng', variant: 'default' },
  cancelled: { label: 'Đã huỷ', variant: 'danger' },
};

const candidateStatusLabel: Record<CandidateStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  new: { label: 'Mới', variant: 'default' },
  screening: { label: 'Sàng lọc', variant: 'info' },
  interview: { label: 'Phỏng vấn', variant: 'warning' },
  offer: { label: 'Offer', variant: 'info' },
  hired: { label: 'Đã tuyển', variant: 'success' },
  rejected: { label: 'Từ chối', variant: 'danger' },
};

const nextStatus: Partial<Record<CandidateStatus, CandidateStatus>> = {
  new: 'screening',
  screening: 'interview',
  interview: 'offer',
  offer: 'hired',
};

export default function RecruitmentPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'requests' | 'candidates'>('requests');
  const [openForm, setOpenForm] = useState(false);
  const [position, setPosition] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');

  const { data: requests, isLoading: loadingReqs } = useQuery({
    queryKey: ['recruitment'],
    queryFn: () => getRecruitmentRequests({ page: 1, pageSize: 20 }),
    enabled: tab === 'requests',
  });

  const { data: candidates, isLoading: loadingCands } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => getCandidates({ page: 1, pageSize: 20 }),
    enabled: tab === 'candidates',
  });

  const createReq = useMutation({
    mutationFn: () => createRecruitmentRequest({ position, quantity: Number(quantity), description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruitment'] });
      setOpenForm(false);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      updateCandidateStatus(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidates'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Tuyển dụng</h1>
        <Button onClick={() => setOpenForm(true)}>
          <Plus size={16} /> Tạo yêu cầu
        </Button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['requests', 'candidates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'requests' ? 'Yêu cầu tuyển dụng' : 'Ứng viên'}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        loadingReqs ? <PageSpinner /> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Vị trí</TableTh>
                <TableTh>Số lượng</TableTh>
                <TableTh>Người tạo</TableTh>
                <TableTh>Ngày tạo</TableTh>
                <TableTh>Trạng thái</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests?.data.map((r) => {
                const status = reqStatusLabel[r.status];
                return (
                  <TableRow key={r.requestId}>
                    <TableTd className="font-medium">{r.position}</TableTd>
                    <TableTd>{r.quantity}</TableTd>
                    <TableTd>{r.createdByName}</TableTd>
                    <TableTd>{formatDate(r.createdAt)}</TableTd>
                    <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )
      )}

      {tab === 'candidates' && (
        loadingCands ? <PageSpinner /> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Ứng viên</TableTh>
                <TableTh>Vị trí ứng tuyển</TableTh>
                <TableTh>Nguồn</TableTh>
                <TableTh>Ngày nộp</TableTh>
                <TableTh>Trạng thái</TableTh>
                <TableTh />
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates?.data.map((c) => {
                const status = candidateStatusLabel[c.status];
                const next = nextStatus[c.status];
                return (
                  <TableRow key={c.candidateId}>
                    <TableTd>
                      <p className="font-medium">{c.fullName}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </TableTd>
                    <TableTd>{c.appliedPosition}</TableTd>
                    <TableTd>{c.source}</TableTd>
                    <TableTd>{formatDate(c.createdAt)}</TableTd>
                    <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                    <TableTd>
                      <div className="flex gap-2">
                        {next && (
                          <Button size="sm" onClick={() => updateStatus.mutate({ id: c.candidateId, status: next })}>
                            {candidateStatusLabel[next].label}
                          </Button>
                        )}
                        {c.status !== 'rejected' && c.status !== 'hired' && (
                          <Button size="sm" variant="danger" onClick={() => updateStatus.mutate({ id: c.candidateId, status: 'rejected' })}>
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
        )
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Tạo yêu cầu tuyển dụng">
        <div className="space-y-4">
          <Input label="Vị trí tuyển" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Input label="Số lượng" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => createReq.mutate()} loading={createReq.isPending}>Lưu</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
