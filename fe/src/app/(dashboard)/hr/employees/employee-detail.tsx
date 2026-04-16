'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Pencil, X, Check, ChevronDown, ChevronUp, PenLine, Banknote } from 'lucide-react';
import { updateEmployee, selfUpdateEmployee, createProposal } from '@/services/employee.service';
import { getEmployeeContracts, signContract, updateContract } from '@/services/contract.service';
import { Button, Input, Select, Badge, Modal } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Employee, Branch } from '@/types';

interface Props {
  employee: Employee;
  role: string;
  currentEmployeeId?: string;
  currentEmployeeName?: string;
  branches: Branch[];
  defaultOpenContracts?: boolean;
  onClose: () => void;
}

const SHIFT_LABEL: Record<string, string> = {
  HANH_CHINH: 'Hành chính (9:00–18:00)',
  CA_SANG:    'Ca sáng (7:00–15:00)',
  CA_TOI:     'Ca tối (15:00–23:00)',
};

const statusMap: Record<string, { label: string; variant: 'success' | 'danger' | 'default' }> = {
  ACTIVE:   { label: 'Đang làm việc', variant: 'success' },
  RESIGNED: { label: 'Đã nghỉ việc',  variant: 'danger' },
};

const genderLabel: Record<string, string> = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

export function EmployeeDetail({ employee, role, currentEmployeeId, currentEmployeeName, branches, defaultOpenContracts = false, onClose }: Props) {
  const qc = useQueryClient();
  const isDirector = role === 'director';
  const isManager  = role === 'branch_manager';
  const isSelf     = currentEmployeeId === employee.employeeId;
  const canFullEdit    = isDirector;
  const canChangeBranch = isDirector;
  const canSelfEdit    = isSelf && !isDirector && !isManager;
  const canEdit        = canFullEdit || canSelfEdit;
  const canPropose     = isManager && !isSelf;

  const [editing, setEditing] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [showContracts, setShowContracts] = useState(defaultOpenContracts);
  const [signingContract, setSigningContract] = useState<typeof contracts[0] | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [adjustingSalary, setAdjustingSalary] = useState(false);
  const [newBaseSalary, setNewBaseSalary] = useState('');
  const [newAllowance, setNewAllowance] = useState('');

  const { data: contracts = [], refetch: refetchContracts } = useQuery({
    queryKey: ['employee-contracts', employee.employeeId],
    queryFn: () => getEmployeeContracts(employee.employeeId),
    enabled: showContracts || isDirector,
  });

  const signMut = useMutation({
    mutationFn: (id: string) => signContract(id),
    onSuccess: () => { refetchContracts(); setSigningContract(null); setAgreed(false); },
  });

  const activeContract = contracts.find((c) => c.status === 'ACTIVE');

  const salaryMut = useMutation({
    mutationFn: () => updateContract(activeContract!.contractId, {
      baseSalary: newBaseSalary ? Number(newBaseSalary) : undefined,
      allowance:  newAllowance  ? Number(newAllowance)  : undefined,
    }),
    onSuccess: () => { refetchContracts(); setAdjustingSalary(false); },
  });
  const { register, handleSubmit, reset } = useForm({ defaultValues: { ...employee } });
  const { register: regProp, handleSubmit: handleProp, reset: resetProp, formState: { errors: propErrors } } = useForm<{
    proposedPosition: string;
    proposedDepartment: string;
    reason: string;
  }>();

  const fullMutation = useMutation({
    mutationFn: (data: any) => updateEmployee(employee.employeeId, { ...data, branch: { branchId: data.branchId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setEditing(false); },
  });
  const selfMutation = useMutation({
    mutationFn: (data: any) => selfUpdateEmployee(employee.employeeId, {
      phoneNumber: data.phoneNumber, address: data.address, bankAccount: data.bankAccount,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setEditing(false); },
  });
  const proposalMutation = useMutation({
    mutationFn: (data: { proposedPosition: string; proposedDepartment: string; reason: string }) =>
      createProposal({
        employeeId: employee.employeeId,
        proposedBy: currentEmployeeId ?? '',
        proposedByName: currentEmployeeName ?? '',
        proposedPosition: data.proposedPosition,
        proposedDepartment: data.proposedDepartment,
        reason: data.reason,
      }),
    onSuccess: () => { setProposing(false); resetProp(); },
  });

  function onSubmit(data: any) {
    if (canFullEdit) fullMutation.mutate(data);
    else if (canSelfEdit) selfMutation.mutate(data);
  }

  const st = statusMap[employee.status] ?? { label: employee.status, variant: 'default' as const };
  const loading = fullMutation.isPending || selfMutation.isPending;

  return (
    <Modal open onClose={onClose} title="Hồ sơ nhân viên" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            {employee.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{employee.fullName}</p>
            <p className="text-xs text-gray-500">{employee.employeeId} · {employee.position}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={st.variant}>{st.label}</Badge>
            {isDirector && activeContract && !editing && (
              <button type="button"
                onClick={() => {
                  setNewBaseSalary(String(activeContract.baseSalary));
                  setNewAllowance(String(activeContract.allowance ?? 0));
                  setShowContracts(true);
                  setAdjustingSalary(true);
                }}
                className="flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Banknote size={11} /> Điều chỉnh lương
              </button>
            )}
            {canPropose && !editing && (
              <button type="button" onClick={() => { resetProp(); setProposing(true); }}
                className="flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors">
                Đề xuất
              </button>
            )}
            {canEdit && !editing && (
              <button type="button" onClick={() => { reset({ ...employee }); setEditing(true); }}
                className="flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Pencil size={11} /> Sửa
              </button>
            )}
            {editing && (
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setEditing(false)}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                  <X size={11} /> Huỷ
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                  <Check size={11} /> Lưu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid 2 cột */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <Field label="Họ và tên">
            {editing && canFullEdit ? <Input {...register('fullName')} className="h-7 text-sm" /> : employee.fullName}
          </Field>
          <Field label="Ngày sinh">
            {editing && canFullEdit ? <Input type="date" {...register('dateOfBirth')} className="h-7 text-sm" /> : formatDate(employee.dateOfBirth)}
          </Field>
          <Field label="Giới tính">
            {editing && canFullEdit
              ? <Select options={[{value:'MALE',label:'Nam'},{value:'FEMALE',label:'Nữ'},{value:'OTHER',label:'Khác'}]} {...register('gender')} className="h-7 text-sm" />
              : (genderLabel[employee.gender ?? ''] ?? '—')}
          </Field>
          <Field label="CMND/CCCD">
            {editing && canFullEdit ? <Input {...register('idCard')} className="h-7 text-sm" /> : employee.idCard}
          </Field>
          <Field label="Email">
            {editing && canFullEdit ? <Input type="email" {...register('email')} className="h-7 text-sm" /> : (employee.email ?? '—')}
          </Field>
          <Field label="Số điện thoại">
            {editing && canEdit ? <Input {...register('phoneNumber')} className="h-7 text-sm" /> : (employee.phoneNumber ?? '—')}
          </Field>
          <Field label="Địa chỉ" full>
            {editing && canEdit ? <Input {...register('address')} className="h-7 text-sm" /> : (employee.address ?? '—')}
          </Field>
          <Field label="Tài khoản ngân hàng">
            {editing && canEdit ? <Input {...register('bankAccount')} className="h-7 text-sm" /> : (employee.bankAccount ?? '—')}
          </Field>
          <Field label="Chức danh">
            {editing && canFullEdit ? <Input {...register('position')} className="h-7 text-sm" /> : employee.position}
          </Field>
          <Field label="Phòng ban">
            {editing && canFullEdit ? <Input {...register('department')} className="h-7 text-sm" /> : (employee.department ?? '—')}
          </Field>
          <Field label="Ca làm việc">
            {editing && canFullEdit
              ? <Select
                  options={[
                    { value: 'HANH_CHINH', label: 'Hành chính (9:00–18:00)' },
                    { value: 'CA_SANG',    label: 'Ca sáng (7:00–15:00)' },
                    { value: 'CA_TOI',     label: 'Ca tối (15:00–23:00)' },
                  ]}
                  placeholder="Chưa thiết lập"
                  {...register('defaultShift')}
                  className="h-7 text-sm"
                />
              : SHIFT_LABEL[employee.defaultShift ?? ''] ?? '—'}
          </Field>
          <Field label="Chi nhánh">
            {editing && canChangeBranch
              ? <Select options={branches.map(b => ({ value: b.branchId, label: b.branchName }))} {...register('branchId')} className="h-7 text-sm" />
              : employee.branchName}
          </Field>
          <Field label="Ngày vào làm">{formatDate(employee.createdAt)}</Field>
        </div>

      </form>

      {/* Proposal form */}
      {proposing && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Đề xuất thay đổi chức danh / phòng ban</p>
          <form onSubmit={handleProp((d) => proposalMutation.mutate(d))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Chức danh mới</p>
                <Input {...regProp('proposedPosition')} placeholder={employee.position} className="h-8 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phòng ban mới</p>
                <Input {...regProp('proposedDepartment')} placeholder={employee.department ?? '—'} className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Lý do <span className="text-red-500">*</span></p>
              <Input
                {...regProp('reason', { required: true })}
                placeholder="Nhập lý do đề xuất..."
                className={`h-8 text-sm ${propErrors.reason ? 'border-red-400' : ''}`}
              />
              {propErrors.reason && <p className="text-xs text-red-500 mt-0.5">Vui lòng nhập lý do</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setProposing(false)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
              <button type="submit" disabled={proposalMutation.isPending}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60 transition-colors">
                {proposalMutation.isPending ? 'Đang gửi...' : 'Gửi đề xuất'}
              </button>
            </div>
            {proposalMutation.isSuccess && (
              <p className="text-xs text-green-600 text-center">Đề xuất đã được gửi thành công!</p>
            )}
            {proposalMutation.isError && (
              <p className="text-xs text-red-500 text-center">Có lỗi xảy ra, vui lòng thử lại.</p>
            )}
          </form>
        </div>
      )}

      {/* Salary adjustment modal */}
      {adjustingSalary && activeContract && (
        <Modal open onClose={() => setAdjustingSalary(false)} title="Điều chỉnh lương" size="sm">
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Lương hiện tại</span>
                <span className="font-medium">{formatCurrency(activeContract.baseSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phụ cấp hiện tại</span>
                <span className="font-medium">{activeContract.allowance ? formatCurrency(activeContract.allowance) : '—'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Lương mới (VNĐ)</label>
                <Input type="number" step="100000" min="0"
                  value={newBaseSalary}
                  onChange={(e) => setNewBaseSalary(e.target.value)}
                  className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phụ cấp mới (VNĐ)</label>
                <Input type="number" step="100000" min="0"
                  value={newAllowance}
                  onChange={(e) => setNewAllowance(e.target.value)}
                  className="h-9 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setAdjustingSalary(false)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                Huỷ
              </button>
              <button
                onClick={() => salaryMut.mutate()}
                disabled={salaryMut.isPending}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                <Check size={12} />
                {salaryMut.isPending ? 'Đang lưu...' : 'Xác nhận điều chỉnh'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sign confirmation dialog */}
      {signingContract && (
        <Modal open onClose={() => { setSigningContract(null); setAgreed(false); }} title="Ký xác nhận hợp đồng" size="sm">
          <div className="space-y-4">
            {/* Contract summary */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Loại hợp đồng</span>
                <span className="font-medium text-gray-800">{signingContract.contractType}</span>
              </div>
              {signingContract.position && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vị trí</span>
                  <span className="font-medium text-gray-800">{signingContract.position}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Lương cơ bản</span>
                <span className="font-medium text-gray-800">{formatCurrency(signingContract.baseSalary)}</span>
              </div>
              {signingContract.allowance > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phụ cấp</span>
                  <span className="font-medium text-gray-800">{formatCurrency(signingContract.allowance)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Thời hạn</span>
                <span className="font-medium text-gray-800">
                  {formatDate(signingContract.startDate)}{signingContract.endDate ? ` → ${formatDate(signingContract.endDate)}` : ''}
                </span>
              </div>
              {signingContract.workingHours && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Giờ làm việc</span>
                  <span className="font-medium text-gray-800">{signingContract.workingHours}</span>
                </div>
              )}
              {signingContract.leavePolicy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Nghỉ phép</span>
                  <span className="font-medium text-gray-800">{signingContract.leavePolicy}</span>
                </div>
              )}
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                Tôi đã đọc và đồng ý với tất cả các điều khoản trong hợp đồng trên.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => { setSigningContract(null); setAgreed(false); }}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                Huỷ
              </button>
              <button
                onClick={() => signMut.mutate(signingContract.contractId)}
                disabled={!agreed || signMut.isPending}
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <PenLine size={12} />
                {signMut.isPending ? 'Đang xử lý...' : 'Xác nhận ký'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contracts section */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowContracts((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <span>Thông tin hợp đồng</span>
          {showContracts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showContracts && (
          <div className="mt-3 space-y-2">
            {contracts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Chưa có hợp đồng nào.</p>
            ) : (
              contracts.map((c) => {
                const isActive = c.status === 'ACTIVE';
                const canSign  = isSelf && isActive && !c.signedByEmployee;
                const statusLabel: Record<string, string> = {
                  ACTIVE: 'Hiệu lực', PENDING: 'Chờ duyệt', DRAFT: 'Nháp',
                  REJECTED: 'Từ chối', TERMINATED: 'Chấm dứt', EXPIRED: 'Hết hạn',
                };
                const statusColor: Record<string, string> = {
                  ACTIVE: 'bg-green-100 text-green-700',
                  PENDING: 'bg-amber-100 text-amber-700',
                  DRAFT: 'bg-gray-100 text-gray-500',
                  REJECTED: 'bg-red-100 text-red-600',
                  TERMINATED: 'bg-red-100 text-red-600',
                  EXPIRED: 'bg-gray-100 text-gray-500',
                };
                return (
                  <div key={c.contractId}
                    className={`rounded-lg border px-4 py-3 ${isActive ? 'border-indigo-100 bg-indigo-50/60' : 'border-gray-100 bg-white'}`}>
                    {/* top row */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">{c.contractType}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {statusLabel[c.status] ?? c.status}
                      </span>
                    </div>
                    {/* salary row */}
                    <div className="flex gap-4 text-xs text-gray-700 mb-1.5">
                      <span><span className="text-gray-400">Lương: </span>{formatCurrency(c.baseSalary)}</span>
                      {c.allowance > 0 && <span><span className="text-gray-400">Phụ cấp: </span>{formatCurrency(c.allowance)}</span>}
                    </div>
                    {/* date + extras */}
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>{formatDate(c.startDate)}{c.endDate ? ` → ${formatDate(c.endDate)}` : ''}</p>
                      {c.workingHours && <p>{c.workingHours}{c.leavePolicy ? ` · ${c.leavePolicy}` : ''}</p>}
                    </div>
                    {/* sign row */}
                    {isActive && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-indigo-100">
                        {c.signedByEmployee
                          ? <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check size={11} /> Đã ký xác nhận{c.signedDate ? ` · ${formatDate(c.signedDate)}` : ''}</span>
                          : <span className="text-xs text-amber-600">Chưa ký xác nhận</span>}
                        {canSign && (
                          <button
                            onClick={() => { setSigningContract(c); setAgreed(false); }}
                            className="flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <PenLine size={11} /> Ký xác nhận
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`py-2 border-b border-gray-50 ${full ? 'col-span-2' : ''}`}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}
