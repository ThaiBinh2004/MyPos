'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Check, X, Pencil, Send } from 'lucide-react';
import {
  getContracts, getExpiringContracts, submitContract,
  approveContract, rejectContract, terminateContract, signContract,
} from '@/services/contract.service';
import {
  Button, Input, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import type { Contract, ContractFilters } from '@/types';
import { ContractForm } from './contract-form';

const STATUS: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default' }> = {
  DRAFT:      { label: 'Nháp',       variant: 'default' },
  PENDING:    { label: 'Chờ duyệt',  variant: 'warning' },
  ACTIVE:     { label: 'Hiệu lực',   variant: 'success' },
  REJECTED:   { label: 'Bị từ chối', variant: 'danger' },
  TERMINATED: { label: 'Đã chấm dứt', variant: 'danger' },
  EXPIRED:    { label: 'Hết hạn',    variant: 'default' },
};


export default function ContractsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isDirector = user?.role === 'director';
  const isManager  = user?.role === 'branch_manager';
  const isEmployee = !isDirector && !isManager;

  const [filters, setFilters] = useState<ContractFilters>({
    branchId: isManager ? (user?.branchId ?? undefined) : undefined,
  });
  const [selected, setSelected] = useState<Contract | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editContract, setEditContract] = useState<Contract | undefined>(undefined);
  const [reviewNote, setReviewNote] = useState('');
  const [showExpiring, setShowExpiring] = useState(false);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', filters],
    queryFn: () => getContracts(filters),
  });

  const { data: expiring = [] } = useQuery({
    queryKey: ['contracts-expiring', user?.branchId],
    queryFn: () => getExpiringContracts(30, isManager ? user?.branchId ?? undefined : undefined),
    enabled: isManager || isDirector,
  });

  function invalidate() { qc.invalidateQueries({ queryKey: ['contracts'] }); }

  const submitMut   = useMutation({ mutationFn: (id: string) => submitContract(id),   onSuccess: invalidate });
  const approveMut  = useMutation({
    mutationFn: ({ id }: { id: string }) => approveContract(id, user?.employeeId ?? '', reviewNote),
    onSuccess: () => { invalidate(); setSelected(null); setReviewNote(''); },
  });
  const rejectMut   = useMutation({
    mutationFn: ({ id }: { id: string }) => rejectContract(id, reviewNote),
    onSuccess: () => { invalidate(); setSelected(null); setReviewNote(''); },
  });
  const terminateMut = useMutation({
    mutationFn: (id: string) => terminateContract(id),
    onSuccess: () => { invalidate(); setSelected(null); },
  });
  const signMut = useMutation({
    mutationFn: (id: string) => signContract(id),
    onSuccess: invalidate,
  });

  const canCreate  = isManager;
  const canEdit    = (c: Contract) => isManager && ['DRAFT', 'REJECTED', 'ACTIVE'].includes(c.status);
  const canSubmit  = (c: Contract) => isManager && (c.status === 'DRAFT' || c.status === 'REJECTED');
  const canApprove = (c: Contract) => isDirector && c.status === 'PENDING';
  const canTerminate = (c: Contract) => isDirector && c.status === 'ACTIVE';
  const canSign    = (c: Contract) => c.status === 'ACTIVE' && !c.signedByEmployee
                      && c.employeeId === user?.employeeId;

  const filtered = isEmployee
    ? contracts.filter((c) => c.employeeId === user?.employeeId)
    : contracts;

  return (
    <div className="space-y-4">
      {/* Expiring warning banner */}
      {expiring.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="flex-1 text-sm font-medium text-amber-800">
            Có {expiring.length} hợp đồng sắp hết hạn trong 30 ngày tới
          </p>
          <button onClick={() => setShowExpiring(true)}
            className="text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900">
            Xem chi tiết
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <Select
            options={[
              { value: 'DRAFT',      label: 'Nháp' },
              { value: 'PENDING',    label: 'Chờ duyệt' },
              { value: 'ACTIVE',     label: 'Hiệu lực' },
              { value: 'REJECTED',   label: 'Bị từ chối' },
              { value: 'TERMINATED', label: 'Đã chấm dứt' },
            ]}
            placeholder="Tất cả trạng thái"
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
            className="w-44"
          />
        </div>
        <div className="flex gap-2">
          {expiring.length > 0 && (
            <Button variant="outline" onClick={() => setShowExpiring(true)}
              className="relative text-amber-600 border-amber-200 hover:bg-amber-50">
              <AlertTriangle size={15} />
              Sắp hết hạn
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {expiring.length}
              </span>
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => { setEditContract(undefined); setOpenForm(true); }}>
              <Plus size={16} /> Tạo hợp đồng
            </Button>
          )}
        </div>
      </div>

      {isLoading ? <PageSpinner /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nhân viên</TableTh>
              <TableTh>Thời hạn</TableTh>
              <TableTh>Lương cơ bản</TableTh>
              <TableTh>Phụ cấp</TableTh>
              <TableTh>Trạng thái</TableTh>
              <TableTh>Ký xác nhận</TableTh>
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((c) => {
              const st = STATUS[c.status] ?? { label: c.status, variant: 'default' as const };
              return (
                <TableRow key={c.contractId} className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelected(c)}>
                  <TableTd onClick={(e) => e.stopPropagation()}>
                    <p className="font-medium text-gray-900">{c.employeeName}</p>
                    <p className="text-xs text-gray-500">{c.employeeId}</p>
                  </TableTd>
                  <TableTd>
                    <p className="text-xs">{formatDate(c.startDate)}</p>
                    <p className="text-xs text-gray-400">{c.endDate ? `→ ${formatDate(c.endDate)}` : 'Vô thời hạn'}</p>
                  </TableTd>
                  <TableTd>{formatCurrency(c.baseSalary)}</TableTd>
                  <TableTd>{c.allowance ? formatCurrency(c.allowance) : '—'}</TableTd>
                  <TableTd><Badge variant={st.variant}>{st.label}</Badge></TableTd>
                  <TableTd>
                    {c.status === 'ACTIVE'
                      ? c.signedByEmployee
                        ? <span className="text-xs text-green-600 font-medium">Đã ký</span>
                        : <span className="text-xs text-gray-400">Chưa ký</span>
                      : '—'}
                  </TableTd>
                  <TableTd onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5 flex-wrap">
                      {canEdit(c) && (
                        <button onClick={() => { setEditContract(c); setOpenForm(true); }}
                          className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
                          <Pencil size={11} /> Sửa
                        </button>
                      )}
                      {canSubmit(c) && (
                        <button onClick={() => submitMut.mutate(c.contractId)}
                          className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-100">
                          <Send size={11} /> Gửi duyệt
                        </button>
                      )}
                      {canSign(c) && (
                        <button onClick={() => signMut.mutate(c.contractId)}
                          className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-600 hover:bg-green-100">
                          <Check size={11} /> Ký xác nhận
                        </button>
                      )}
                    </div>
                  </TableTd>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableTd colSpan={8}>
                  <p className="text-center text-sm text-gray-400 py-6">Chưa có hợp đồng nào.</p>
                </TableTd>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Contract Detail + Actions modal */}
      {selected && (
        <Modal open onClose={() => { setSelected(null); setReviewNote(''); }} title="Chi tiết hợp đồng" size="md">
          <ContractDetail
            contract={selected}
            canApprove={canApprove(selected)}
            canTerminate={canTerminate(selected)}
            reviewNote={reviewNote}
            onReviewNote={setReviewNote}
            onApprove={() => approveMut.mutate({ id: selected.contractId })}
            onReject={() => rejectMut.mutate({ id: selected.contractId })}
            onTerminate={() => terminateMut.mutate(selected.contractId)}
            loading={approveMut.isPending || rejectMut.isPending || terminateMut.isPending}
          />
        </Modal>
      )}

      {/* Create / Edit form modal */}
      <Modal open={openForm} onClose={() => setOpenForm(false)}
        title={editContract ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'} size="md">
        <ContractForm
          branchId={isManager ? user?.branchId ?? undefined : undefined}
          editContract={editContract}
          onSuccess={() => { setOpenForm(false); invalidate(); }}
        />
      </Modal>

      {/* Expiring contracts modal */}
      {showExpiring && (
        <Modal open onClose={() => setShowExpiring(false)} title="Hợp đồng sắp hết hạn (30 ngày)" size="md">
          <div className="space-y-3">
            {expiring.map((c) => (
              <div key={c.contractId} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.employeeName}</p>
                  <p className="text-xs text-gray-500">{c.contractType} · {c.branchName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">{formatDate(c.endDate!)}</p>
                  <p className="text-xs text-gray-400">Ngày kết thúc</p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

interface DetailProps {
  contract: Contract;
  canApprove: boolean;
  canTerminate: boolean;
  reviewNote: string;
  onReviewNote: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onTerminate: () => void;
  loading: boolean;
}

function ContractDetail({ contract: c, canApprove, canTerminate, reviewNote, onReviewNote, onApprove, onReject, onTerminate, loading }: DetailProps) {
  const st = STATUS[c.status] ?? { label: c.status, variant: 'default' as const };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{c.employeeName}</p>
          <p className="text-xs text-gray-500">{c.employeeId} · {c.branchName}</p>
        </div>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <DRow label="Mã hợp đồng">{c.contractId}</DRow>
        <DRow label="Loại hợp đồng">{c.contractType}</DRow>
        <DRow label="Ngày bắt đầu">{formatDate(c.startDate)}</DRow>
        <DRow label="Ngày kết thúc">{c.endDate ? formatDate(c.endDate) : 'Vô thời hạn'}</DRow>
        {c.position && <DRow label="Vị trí" full>{c.position}</DRow>}
        <DRow label="Lương cơ bản">{formatCurrency(c.baseSalary)}</DRow>
        <DRow label="Phụ cấp">{c.allowance ? formatCurrency(c.allowance) : '—'}</DRow>
        {c.workingHours && <DRow label="Giờ làm việc" full>{c.workingHours}</DRow>}
        {c.leavePolicy && <DRow label="Nghỉ phép" full>{c.leavePolicy}</DRow>}
        {c.otherTerms && <DRow label="Thỏa thuận khác" full>{c.otherTerms}</DRow>}
        {c.approvedByName && <DRow label="Người duyệt">{c.approvedByName}</DRow>}
        {c.approvedDate && <DRow label="Ngày duyệt">{formatDate(c.approvedDate)}</DRow>}
        {c.reviewerNote && <DRow label="Ghi chú" full>{c.reviewerNote}</DRow>}
        <DRow label="Ký xác nhận">
          {c.status === 'ACTIVE'
            ? c.signedByEmployee ? `Đã ký${c.signedDate ? ` (${formatDate(c.signedDate)})` : ''}` : 'Chưa ký'
            : '—'}
        </DRow>
      </div>

      {(canApprove || canTerminate) && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {canApprove && (
            <>
              <Input
                value={reviewNote}
                onChange={(e) => onReviewNote(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)..."
                className="h-8 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button onClick={onReject} disabled={loading}
                  className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 disabled:opacity-60">
                  <X size={12} /> Từ chối
                </button>
                <button onClick={onApprove} disabled={loading}
                  className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                  <Check size={12} /> Duyệt hợp đồng
                </button>
              </div>
            </>
          )}
          {canTerminate && (
            <div className="flex justify-end">
              <button onClick={onTerminate} disabled={loading}
                className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60">
                Chấm dứt hợp đồng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DRow({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`${full ? 'col-span-2' : ''} py-1.5 border-b border-gray-50`}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{children}</p>
    </div>
  );
}
