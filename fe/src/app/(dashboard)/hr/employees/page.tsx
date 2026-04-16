'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pencil, ClipboardList, Check, X } from 'lucide-react';
import { getEmployees, getBranches, deactivateEmployee, getProposals, approveProposal, rejectProposal } from '@/services/employee.service';
import {
  Button, Input, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Avatar, PageSpinner, Pagination, Modal,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { isManager } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';
import type { Employee, EmployeeFilters, EmployeeProposal } from '@/types';
import { EmployeeDetail } from './employee-detail';

const statusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'default' }> = {
  ACTIVE:   { label: 'Đang làm', variant: 'success' },
  RESIGNED: { label: 'Đã nghỉ',  variant: 'danger' },
};

const proposalStatusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'default' }> = {
  pending:  { label: 'Chờ duyệt', variant: 'default' },
  approved: { label: 'Đã duyệt',  variant: 'success' },
  rejected: { label: 'Từ chối',   variant: 'danger' },
};

export default function EmployeesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const manager = isManager(user?.role ?? '');
  const isDirector = user?.role === 'director';
  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showProposals, setShowProposals] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => getEmployees(filters),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const { data: proposals = [], isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => getProposals(),
    enabled: showProposals && isDirector,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => approveProposal(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      setReviewingId(null);
      setReviewNote('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => rejectProposal(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      setReviewingId(null);
      setReviewNote('');
    },
  });

  function handleSearch() {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }

  const branchOptions = branches.map((b) => ({ value: b.branchId, label: b.branchName }));
  const pendingCount = proposals.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Tìm theo tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search size={16} />
          </Button>
        </div>
        <Select
          options={branchOptions}
          placeholder="Tất cả chi nhánh"
          onChange={(e) => setFilters((f) => ({ ...f, branchId: e.target.value || undefined, page: 1 }))}
          className="w-48"
        />
        <Select
          options={[
            { value: 'ACTIVE',   label: 'Đang làm' },
            { value: 'RESIGNED', label: 'Đã nghỉ' },
          ]}
          placeholder="Tất cả trạng thái"
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
          className="w-44"
        />
        {isDirector && (
          <Button variant="outline" onClick={() => setShowProposals(true)} className="relative">
            <ClipboardList size={16} />
            Đề xuất
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nhân viên</TableTh>
              <TableTh>Chức vụ</TableTh>
              <TableTh>Chi nhánh</TableTh>
              <TableTh>Ngày sinh</TableTh>
              <TableTh>Số điện thoại</TableTh>
              <TableTh>Trạng thái</TableTh>
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((emp) => {
              const status = statusLabel[emp.status] ?? { label: emp.status, variant: 'default' as const };
              return (
                <TableRow key={emp.employeeId}>
                  <TableTd>
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.fullName} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{emp.fullName}</p>
                        <p className="text-xs text-gray-500">{emp.employeeId}</p>
                      </div>
                    </div>
                  </TableTd>
                  <TableTd>{emp.position}</TableTd>
                  <TableTd>{emp.branchName}</TableTd>
                  <TableTd>{formatDate(emp.dateOfBirth)}</TableTd>
                  <TableTd>{emp.phoneNumber ?? '—'}</TableTd>
                  <TableTd>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableTd>
                  <TableTd>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(emp)}>
                        <Pencil size={14} /> Chỉnh sửa
                      </Button>
                      {manager && emp.status === 'ACTIVE' && (
                        <Button variant="ghost" size="sm" onClick={() => deactivate.mutate(emp.employeeId)}>
                          Nghỉ việc
                        </Button>
                      )}
                    </div>
                  </TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {data && (
        <Pagination
          page={filters.page ?? 1}
          total={data.total}
          pageSize={filters.pageSize ?? 20}
          onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        />
      )}

      {selected && (
        <EmployeeDetail
          employee={selected}
          role={user?.role ?? ''}
          currentEmployeeId={user?.employeeId ?? undefined}
          currentEmployeeName={user?.fullName ?? undefined}
          branches={branches}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Director: Proposals modal */}
      {showProposals && (
        <Modal open onClose={() => setShowProposals(false)} title="Đề xuất thay đổi nhân viên" size="lg">
          <div className="space-y-3">
            {loadingProposals ? (
              <p className="text-sm text-gray-400 text-center py-6">Đang tải...</p>
            ) : proposals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Chưa có đề xuất nào.</p>
            ) : (
              proposals.map((p) => (
                <ProposalCard
                  key={p.proposalId}
                  proposal={p}
                  reviewingId={reviewingId}
                  reviewNote={reviewNote}
                  onReviewNote={setReviewNote}
                  onStartReview={(id) => { setReviewingId(id); setReviewNote(''); }}
                  onCancelReview={() => { setReviewingId(null); setReviewNote(''); }}
                  onApprove={(id) => approveMutation.mutate({ id, note: reviewNote })}
                  onReject={(id) => rejectMutation.mutate({ id, note: reviewNote })}
                  loading={approveMutation.isPending || rejectMutation.isPending}
                />
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

interface ProposalCardProps {
  proposal: EmployeeProposal;
  reviewingId: string | null;
  reviewNote: string;
  onReviewNote: (v: string) => void;
  onStartReview: (id: string) => void;
  onCancelReview: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading: boolean;
}

function ProposalCard({ proposal: p, reviewingId, reviewNote, onReviewNote, onStartReview, onCancelReview, onApprove, onReject, loading }: ProposalCardProps) {
  const st = proposalStatusLabel[p.status] ?? { label: p.status, variant: 'default' as const };
  const isReviewing = reviewingId === p.proposalId;

  return (
    <div className="rounded-lg border border-gray-100 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-900">{p.employeeName}
            <span className="ml-1 text-xs text-gray-400">({p.employeeId})</span>
          </p>
          <p className="text-xs text-gray-500">Đề xuất bởi: {p.proposedByName}</p>
        </div>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-700">
        {p.proposedPosition && (
          <p><span className="text-gray-400">Chức danh mới:</span> {p.proposedPosition}</p>
        )}
        {p.proposedDepartment && (
          <p><span className="text-gray-400">Phòng ban mới:</span> {p.proposedDepartment}</p>
        )}
      </div>

      <p className="text-xs text-gray-600"><span className="text-gray-400">Lý do:</span> {p.reason}</p>

      {p.reviewerNote && (
        <p className="text-xs text-gray-500 italic"><span className="text-gray-400">Ghi chú:</span> {p.reviewerNote}</p>
      )}

      {p.status === 'pending' && !isReviewing && (
        <div className="flex justify-end">
          <button onClick={() => onStartReview(p.proposalId)}
            className="text-xs text-indigo-600 hover:underline">
            Xem xét
          </button>
        </div>
      )}

      {isReviewing && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <Input
            value={reviewNote}
            onChange={(e) => onReviewNote(e.target.value)}
            placeholder="Ghi chú (tuỳ chọn)..."
            className="h-8 text-xs"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onCancelReview}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
              <X size={10} /> Huỷ
            </button>
            <button onClick={() => onReject(p.proposalId)} disabled={loading}
              className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100 disabled:opacity-60">
              <X size={10} /> Từ chối
            </button>
            <button onClick={() => onApprove(p.proposalId)} disabled={loading}
              className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
              <Check size={10} /> Duyệt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
