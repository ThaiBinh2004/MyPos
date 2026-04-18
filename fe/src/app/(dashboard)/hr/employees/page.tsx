'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pencil, ClipboardList, Check, X, UserMinus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getEmployees, getBranches, getProposals, approveProposal, rejectProposal } from '@/services/employee.service';
import {
  getOffboardings, confirmAssetReturn, submitOffboardingApproval,
  approveOffboarding, rejectOffboarding, generateOtp,
} from '@/services/offboarding.service';
import {
  Button, Input, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Avatar, PageSpinner, Pagination, Modal,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { isAdmin, isManager } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';
import type { Employee, EmployeeFilters, EmployeeProposal, Offboarding, OffboardingAssetReturn, AssetReturnStatus, OffboardingStatus } from '@/types';
import { EmployeeDetail } from './employee-detail';

const proposalStatusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'default' }> = {
  pending:  { label: 'Chờ duyệt', variant: 'default' },
  approved: { label: 'Đã duyệt',  variant: 'success' },
  rejected: { label: 'Từ chối',   variant: 'danger' },
};

const offboardingStatusConfig: Record<OffboardingStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  INITIATED:         { label: 'Khởi tạo',       variant: 'default' },
  ASSETS_PENDING:    { label: 'Chờ thu hồi TS', variant: 'warning' },
  ASSETS_CONFIRMED:  { label: 'TS đã xác nhận', variant: 'info' },
  PENDING_APPROVAL:  { label: 'Chờ duyệt',       variant: 'warning' },
  COMPLETED:         { label: 'Hoàn tất',         variant: 'success' },
  SETTLED:           { label: 'Đã quyết toán',    variant: 'info' },
};

const returnStatusConfig: Record<AssetReturnStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  PENDING:          { label: 'Chờ trả',     variant: 'default' },
  RETURNED_GOOD:    { label: 'Trả - Tốt',   variant: 'success' },
  RETURNED_DAMAGED: { label: 'Trả - Hỏng',  variant: 'warning' },
  MISSING:          { label: 'Mất TS',      variant: 'danger' },
};

const RETURN_STATUS_OPTIONS = [
  { value: 'RETURNED_GOOD',    label: 'Trả - Tình trạng tốt' },
  { value: 'RETURNED_DAMAGED', label: 'Trả - Bị hỏng' },
  { value: 'MISSING',          label: 'Mất / Không tìm thấy' },
];

export default function EmployeesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isDirector = isAdmin(user?.role ?? '');
  const isMgr = isManager(user?.role ?? '');
  const canSeeOffboarding = user?.role === 'branch_manager';
  const branchIdFilter = (!isDirector && isMgr) ? (user?.branchId ?? undefined) : undefined;

  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showProposals, setShowProposals] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Offboarding state
  const [showOffboardings, setShowOffboardings] = useState(false);
  const [expandedOb, setExpandedOb] = useState<string | null>(null);
  const [confirmReturn, setConfirmReturn] = useState<OffboardingAssetReturn | null>(null);
  const [returnStatus, setReturnStatus] = useState<AssetReturnStatus>('RETURNED_GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCompensation, setReturnCompensation] = useState('');
  const [approveModal, setApproveModal] = useState<Offboarding | null>(null);
  const [directorNote, setDirectorNote] = useState('');
  const [approveAction, setApproveAction] = useState<'approve' | 'reject'>('approve');
  const [assetRecoveryConfirmed, setAssetRecoveryConfirmed] = useState(false);

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

  const { data: proposals2 } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => getProposals(),
    enabled: isDirector,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => approveProposal(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      setReviewingId(null); setReviewNote('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => rejectProposal(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      setReviewingId(null); setReviewNote('');
    },
  });

  function handleSearch() {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }

  const branchOptions = branches.map((b) => ({ value: b.branchId, label: b.branchName }));
  const pendingCount = (proposals2 ?? []).filter((p) => p.status === 'pending').length;

  const [showPendingApproval, setShowPendingApproval] = useState(false);

  const { data: offboardings = [], isLoading: loadingOb } = useQuery({
    queryKey: ['offboardings', branchIdFilter],
    queryFn: () => getOffboardings(branchIdFilter),
    enabled: canSeeOffboarding,
  });

  const { data: pendingApprovalObs = [] } = useQuery({
    queryKey: ['offboardings-pending-approval'],
    queryFn: () => getOffboardings(),
    enabled: isDirector,
    select: (list) => list.filter(o => o.status === 'PENDING_APPROVAL'),
  });

  const pendingObCount = offboardings.filter(o =>
    o.status === 'ASSETS_PENDING' || o.status === 'ASSETS_CONFIRMED' || o.status === 'PENDING_APPROVAL'
  ).length;

  const confirmMutation = useMutation({
    mutationFn: () => confirmAssetReturn(confirmReturn!.returnId, {
      returnStatus, notes: returnNotes,
      compensationAmount: returnCompensation ? Number(returnCompensation) : 0,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offboardings'] });
      setConfirmReturn(null); setReturnNotes(''); setReturnCompensation('');
    },
  });

  const [mgrOtpTarget, setMgrOtpTarget] = useState<string | null>(null);
  const [mgrOtpCode, setMgrOtpCode] = useState('');
  const [mgrOtpDemo, setMgrOtpDemo] = useState('');
  const [mgrOtpError, setMgrOtpError] = useState('');

  const genMgrOtpMut = useMutation({
    mutationFn: (id: string) => generateOtp(id, 'MANAGER'),
    onSuccess: (_res, id) => { setMgrOtpTarget(id); setMgrOtpCode(''); setMgrOtpError(''); },
  });

  const submitApprovalMutation = useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => submitOffboardingApproval(id, otp),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['offboardings'] }); setMgrOtpTarget(null); setMgrOtpCode(''); setMgrOtpDemo(''); },
    onError: () => setMgrOtpError('OTP không đúng hoặc đã hết hạn.'),
  });

  const directorMutation = useMutation({
    mutationFn: () => approveAction === 'approve'
      ? approveOffboarding(approveModal!.offboardingId, user!.employeeId!, directorNote)
      : rejectOffboarding(approveModal!.offboardingId, directorNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offboardings'] });
      qc.invalidateQueries({ queryKey: ['employees'] });
      setApproveModal(null); setDirectorNote('');
    },
  });

  const totalCompensation = (returns: OffboardingAssetReturn[]) =>
    returns.reduce((s, r) => s + (r.compensationAmount ?? 0), 0);

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
        {isDirector && (
          <Button variant="outline" onClick={() => setShowPendingApproval(true)} className="relative">
            <UserMinus size={16} />
            Biên bản nghỉ việc
            {pendingApprovalObs.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingApprovalObs.length}
              </span>
            )}
          </Button>
        )}
        {canSeeOffboarding && (
          <Button variant="outline" onClick={() => setShowOffboardings(true)} className="relative">
            <UserMinus size={16} />
            Nghỉ việc
            {pendingObCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingObCount}
              </span>
            )}
          </Button>
        )}
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
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((emp) => {
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
                    <Button variant="ghost" size="sm" onClick={() => setSelected(emp)}>
                      <Pencil size={14} /> Chỉnh sửa
                    </Button>
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

      {/* Modal: Hồ sơ nghỉ việc */}
      <Modal open={showOffboardings} onClose={() => setShowOffboardings(false)} title="Hồ sơ nghỉ việc" size="lg">
        {loadingOb ? <PageSpinner /> : (
          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {offboardings.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có hồ sơ nghỉ việc nào.</p>
            )}
            {offboardings.map(ob => {
              const sc = offboardingStatusConfig[ob.status] ?? { label: ob.status, variant: 'default' as const };
              const isExp = expandedOb === ob.offboardingId;
              const hasIncident = ob.assetReturns.some(r => r.returnStatus === 'RETURNED_DAMAGED' || r.returnStatus === 'MISSING');
              const comp = totalCompensation(ob.assetReturns);
              return (
                <div key={ob.offboardingId} className="rounded-xl border border-slate-200 overflow-hidden">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedOb(isExp ? null : ob.offboardingId)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900">{ob.employeeName}</span>
                        <span className="text-xs text-gray-400">{ob.employeeBranchName}</span>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                        {hasIncident && <Badge variant="warning"><AlertTriangle size={10} className="inline mr-0.5" />Sự cố</Badge>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Ngày nghỉ: {formatDate(ob.lastWorkingDate)} · {ob.reason}</p>
                    </div>
                    {isExp ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                  </button>
                  {isExp && (
                    <div className="border-t border-slate-100 px-4 py-4 space-y-3 bg-slate-50">
                      {comp > 0 && <p className="text-xs text-red-500">Bồi thường tài sản: {formatCurrency(comp)}</p>}
                      {ob.assetReturns.length > 0 && (
                        <div className="space-y-2">
                          {ob.assetReturns.map(r => {
                            const rs = returnStatusConfig[r.returnStatus] ?? { label: r.returnStatus, variant: 'default' as const };
                            return (
                              <div key={r.returnId} className="flex items-center gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2">
                                <div className="flex-1 text-sm text-gray-800">{r.assetName}
                                  {r.notes && <span className="text-xs text-gray-400 ml-2">{r.notes}</span>}
                                </div>
                                <Badge variant={rs.variant}>{rs.label}</Badge>
                                {isMgr && ob.status === 'ASSETS_PENDING' && r.returnStatus === 'PENDING' && (
                                  <Button size="sm" variant="outline" onClick={() => { setConfirmReturn(r); setReturnStatus('RETURNED_GOOD'); setReturnNotes(''); setReturnCompensation(''); }}>
                                    Xác nhận
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {ob.assetReturns.length === 0 && <p className="text-xs text-slate-400 italic">Không có tài sản bàn giao.</p>}

                      {/* Biên bản thu hồi — chỉ hiện khi có sự cố */}
                      {hasIncident && ob.status !== 'SETTLED' && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-3 space-y-1.5">
                          <p className="text-xs font-semibold text-orange-700">Biên bản thu hồi tài sản</p>
                          <div className="space-y-1">
                            {ob.assetReturns.filter(r => r.returnStatus !== 'RETURNED_GOOD').map(r => (
                              <div key={r.returnId} className="flex items-start justify-between text-xs gap-2">
                                <span className="text-gray-700 font-medium">{r.assetName}</span>
                                <div className="text-right shrink-0 space-y-0.5">
                                  <p className={r.returnStatus === 'MISSING' ? 'text-red-600' : 'text-orange-600'}>
                                    {r.returnStatus === 'MISSING' ? 'Mất tài sản' : 'Hư hỏng'}
                                    {r.compensationAmount > 0 && ` · Bồi thường ${formatCurrency(r.compensationAmount)}`}
                                  </p>
                                  {r.notes && <p className="text-gray-400 italic">{r.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                          {!ob.employeeConfirmed && (
                            <p className="text-[11px] text-orange-500 pt-1">⏳ Chờ nhân viên ký xác nhận biên bản</p>
                          )}
                          {ob.employeeConfirmed && ob.status === 'ASSETS_CONFIRMED' && (
                            <p className="text-[11px] text-indigo-600 pt-1">✓ Hai bên đã ký · Chờ gửi giám đốc phê duyệt</p>
                          )}
                          {ob.status === 'PENDING_APPROVAL' && (
                            <p className="text-[11px] text-amber-600 pt-1">⏳ Biên bản đang chờ giám đốc phê duyệt</p>
                          )}
                          {ob.status === 'COMPLETED' && (
                            <p className="text-[11px] text-blue-600 pt-1">✓ Giám đốc đã duyệt · Chuyển kế toán xử lý bồi thường</p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap pt-1">
                        {isMgr && ob.status === 'ASSETS_CONFIRMED' && ob.employeeConfirmed && (
                          <Button size="sm" onClick={() => genMgrOtpMut.mutate(ob.offboardingId)} loading={genMgrOtpMut.isPending}>
                            <CheckCircle size={13} /> Ký & Gửi phê duyệt (OTP)
                          </Button>
                        )}
                        {isMgr && ob.status === 'ASSETS_CONFIRMED' && !ob.employeeConfirmed && (
                          <span className="text-xs text-gray-400 italic">⏳ Chờ nhân viên ký xác nhận biên bản</span>
                        )}
                        {isDirector && ob.status === 'PENDING_APPROVAL' && (
                          <>
                            <Button size="sm" onClick={() => { setApproveModal(ob); setApproveAction('approve'); setDirectorNote(''); }}>
                              <CheckCircle size={13} /> Phê duyệt
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => { setApproveModal(ob); setApproveAction('reject'); setDirectorNote(''); }}>
                              <XCircle size={13} /> Từ chối
                            </Button>
                          </>
                        )}
                        {ob.status === 'COMPLETED' && !hasIncident && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={13} /> Đã duyệt · Chờ kế toán quyết toán</span>
                        )}
                        {ob.status === 'SETTLED' && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={13} /> Đã quyết toán</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Modal: Xác nhận thu hồi tài sản */}
      <Modal open={!!confirmReturn} onClose={() => setConfirmReturn(null)} title={`Xác nhận: ${confirmReturn?.assetName}`}>
        <div className="space-y-4">
          <Select label="Tình trạng" options={RETURN_STATUS_OPTIONS} value={returnStatus} onChange={e => setReturnStatus(e.target.value as AssetReturnStatus)} />
          {(returnStatus === 'RETURNED_DAMAGED' || returnStatus === 'MISSING') && (
            <Input label="Bồi thường (₫)" type="number" value={returnCompensation} onChange={e => setReturnCompensation(e.target.value)} placeholder="0" />
          )}
          <Input label="Ghi chú" value={returnNotes} onChange={e => setReturnNotes(e.target.value)} />
          <div className="flex justify-end">
            <Button onClick={() => confirmMutation.mutate()} loading={confirmMutation.isPending}>Xác nhận</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Manager OTP ký biên bản & gửi phê duyệt */}
      <Modal open={!!mgrOtpTarget} onClose={() => { setMgrOtpTarget(null); setMgrOtpCode(''); setMgrOtpDemo(''); setMgrOtpError(''); }} title="Ký xác nhận biên bản (OTP)">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Xác nhận chữ ký điện tử của quản lý trước khi gửi biên bản nghỉ việc cho giám đốc phê duyệt.</p>
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
            Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhập mã OTP</label>
            <input
              type="text"
              maxLength={6}
              value={mgrOtpCode}
              onChange={e => { setMgrOtpCode(e.target.value.replace(/\D/g, '')); setMgrOtpError(''); }}
              className="w-full text-center text-xl tracking-widest border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="000000"
            />
            {mgrOtpError && <p className="text-xs text-red-500 mt-1">{mgrOtpError}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setMgrOtpTarget(null); setMgrOtpCode(''); setMgrOtpDemo(''); setMgrOtpError(''); }}>Huỷ</Button>
            <Button
              onClick={() => mgrOtpTarget && submitApprovalMutation.mutate({ id: mgrOtpTarget, otp: mgrOtpCode })}
              loading={submitApprovalMutation.isPending}
              disabled={mgrOtpCode.length !== 6}
            >
              Ký & Gửi phê duyệt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Biên bản nghỉ việc cho giám đốc */}
      <Modal open={showPendingApproval} onClose={() => setShowPendingApproval(false)} title="Biên bản nghỉ việc chờ phê duyệt" size="lg">
        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          {pendingApprovalObs.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">Không có hồ sơ nào chờ phê duyệt.</p>
          )}
          {pendingApprovalObs.map(ob => {
            const incidents = ob.assetReturns.filter(r => r.returnStatus === 'RETURNED_DAMAGED' || r.returnStatus === 'MISSING');
            const comp = totalCompensation(ob.assetReturns);
            return (
              <div key={ob.offboardingId} className="rounded-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{ob.employeeName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ob.employeePosition} · {ob.employeeBranchName} · Nghỉ {formatDate(ob.lastWorkingDate)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Lý do: {ob.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => { setApproveModal(ob); setApproveAction('approve'); setDirectorNote(''); setShowPendingApproval(false); }}>
                        <CheckCircle size={13} /> Phê duyệt
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => { setApproveModal(ob); setApproveAction('reject'); setDirectorNote(''); setShowPendingApproval(false); }}>
                        <XCircle size={13} /> Từ chối
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Biên bản thu hồi */}
                {incidents.length > 0 ? (
                  <div className="border-t border-orange-100 bg-orange-50 px-4 py-3 space-y-2">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Biên bản thu hồi tài sản</p>
                    {incidents.map(r => (
                      <div key={r.returnId} className="rounded bg-white border border-orange-100 px-3 py-2 text-xs space-y-0.5">
                        <div className="flex justify-between font-medium text-gray-800">
                          <span>{r.assetName}</span>
                          <span className={r.returnStatus === 'MISSING' ? 'text-red-600' : 'text-orange-600'}>
                            {r.returnStatus === 'MISSING' ? 'Mất tài sản' : 'Hư hỏng'}
                          </span>
                        </div>
                        {r.notes && <p className="text-gray-400 italic">{r.notes}</p>}
                        {r.compensationAmount > 0 && <p className="text-red-500 font-medium">Bồi thường: {formatCurrency(r.compensationAmount)}</p>}
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-semibold pt-1 border-t border-orange-200">
                      <span className="text-orange-700">Tổng bồi thường</span>
                      <span className="text-red-600">{formatCurrency(comp)}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 space-y-0.5">
                      <p>✓ Quản lý: {ob.initiatedByName} đã xác nhận</p>
                      <p>✓ Nhân viên: {ob.employeeName} đã ký</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-green-100 bg-green-50 px-4 py-2 text-xs text-green-700">
                    ✓ Tất cả {ob.assetReturns.length} tài sản trả nguyên vẹn
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Modal: Phê duyệt */}
      <Modal open={!!approveModal} onClose={() => { setApproveModal(null); setAssetRecoveryConfirmed(false); }} title={approveAction === 'approve' ? 'Phê duyệt & Thanh lý hợp đồng' : 'Từ chối hồ sơ'}>
        <div className="space-y-4">
          {approveModal && (() => {
            const incidents = approveModal.assetReturns.filter(r => r.returnStatus !== 'RETURNED_GOOD' && r.returnStatus !== 'PENDING');
            const comp = totalCompensation(approveModal.assetReturns);
            return (
              <>
                {/* Thông tin cơ bản */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
                  <p className="font-semibold text-gray-900">{approveModal.employeeName}</p>
                  <p className="text-gray-500 text-xs">{approveModal.employeePosition} · {approveModal.employeeBranchName}</p>
                  <p className="text-gray-500 text-xs">Ngày nghỉ: {formatDate(approveModal.lastWorkingDate)}</p>
                  <p className="text-gray-500 text-xs">Lý do: {approveModal.reason}</p>
                </div>

                {/* Biên bản thu hồi tài sản — chỉ hiện khi có sự cố */}
                {incidents.length > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Biên bản thu hồi tài sản</p>
                    <div className="space-y-1.5">
                      {incidents.map(r => (
                        <div key={r.returnId} className="rounded bg-white border border-orange-100 px-3 py-2 text-xs space-y-0.5">
                          <div className="flex justify-between font-medium text-gray-800">
                            <span>{r.assetName}</span>
                            <span className={r.returnStatus === 'MISSING' ? 'text-red-600' : 'text-orange-600'}>
                              {r.returnStatus === 'MISSING' ? 'Mất tài sản' : 'Hư hỏng'}
                            </span>
                          </div>
                          {r.notes && <p className="text-gray-400 italic">{r.notes}</p>}
                          {r.compensationAmount > 0 && (
                            <p className="text-red-500 font-medium">Bồi thường: {formatCurrency(r.compensationAmount)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-orange-200 text-xs">
                      <span className="text-orange-600 font-medium">Tổng bồi thường</span>
                      <span className="font-bold text-red-600">{formatCurrency(comp)}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 space-y-0.5 pt-0.5">
                      <p>✓ Quản lý chi nhánh: {approveModal.initiatedByName} đã xác nhận</p>
                      <p>✓ Nhân viên: {approveModal.employeeName} đã ký xác nhận</p>
                    </div>
                  </div>
                )}

                {/* Tài sản nguyên vẹn */}
                {approveModal.assetReturns.filter(r => r.returnStatus === 'RETURNED_GOOD').length > 0 && (
                  <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                    ✓ {approveModal.assetReturns.filter(r => r.returnStatus === 'RETURNED_GOOD').length} tài sản trả nguyên vẹn
                  </div>
                )}
              </>
            );
          })()}
          {approveAction === 'approve' && (
            <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5">
              <input
                type="checkbox"
                checked={assetRecoveryConfirmed}
                onChange={e => setAssetRecoveryConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-indigo-800">
                Tôi xác nhận đã thu hồi đầy đủ tài sản và đồng ý thanh lý hợp đồng lao động.
              </span>
            </label>
          )}
          <Input label={approveAction === 'approve' ? 'Ghi chú (tuỳ chọn)' : 'Lý do từ chối'} value={directorNote} onChange={e => setDirectorNote(e.target.value)} />
          <div className="flex justify-end">
            <Button variant={approveAction === 'approve' ? 'primary' : 'danger'}
              onClick={() => { directorMutation.mutate(); setAssetRecoveryConfirmed(false); }}
              loading={directorMutation.isPending}
              disabled={(approveAction === 'reject' && !directorNote) || (approveAction === 'approve' && !assetRecoveryConfirmed)}>
              {approveAction === 'approve' ? 'Phê duyệt & Thanh lý hợp đồng' : 'Từ chối'}
            </Button>
          </div>
        </div>
      </Modal>

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
        {p.proposedPosition && <p><span className="text-gray-400">Chức danh mới:</span> {p.proposedPosition}</p>}
        {p.proposedDepartment && <p><span className="text-gray-400">Phòng ban mới:</span> {p.proposedDepartment}</p>}
      </div>

      <p className="text-xs text-gray-600"><span className="text-gray-400">Lý do:</span> {p.reason}</p>

      {p.reviewerNote && (
        <p className="text-xs text-gray-500 italic"><span className="text-gray-400">Ghi chú:</span> {p.reviewerNote}</p>
      )}

      {p.status === 'pending' && !isReviewing && (
        <div className="flex justify-end">
          <button onClick={() => onStartReview(p.proposalId)} className="text-xs text-indigo-600 hover:underline">
            Xem xét
          </button>
        </div>
      )}

      {isReviewing && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <Input value={reviewNote} onChange={(e) => onReviewNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)..." className="h-8 text-sm" />
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
