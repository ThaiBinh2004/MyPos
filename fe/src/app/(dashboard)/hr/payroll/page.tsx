'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Check, Pencil, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
  getPayrolls, generateBulk, updatePayroll, finalizePayroll, importSales, addDeduction,
} from '@/services/payroll.service';
// generateBulk dùng nội bộ sau khi import Excel
import {
  Badge, Table, TableHead, TableBody, TableRow, TableTh, TableTd,
  PageSpinner, Modal, Input, Select, Button,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import type { Payroll } from '@/types';

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    opts.push({ value: val, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` });
  }
  return opts;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'default' }> = {
  DRAFT:     { label: 'Nháp',    variant: 'default'  },
  FINALIZED: { label: 'Đã chốt', variant: 'success'  },
};

const ABC_OPTIONS = [
  { value: '',  label: '— Chưa chấm —' },
  { value: 'A', label: 'Hạng A  (+500.000 ₫)' },
  { value: 'B', label: 'Hạng B  (+200.000 ₫)' },
  { value: 'C', label: 'Hạng C  (không thưởng)' },
];

export default function PayrollPage() {
  const qc       = useQueryClient();
  const { user } = useAuth();
  const isDirector = user?.role === 'director';
  const isManager  = user?.role === 'branch_manager';
  const isAccountant = user?.role === 'accountant';
  const canManage  = isDirector || isManager || isAccountant;

  const [month, setMonth] = useState(thisMonth());
  const branchId = isManager ? (user?.branchId ?? undefined) : undefined;

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['payrolls', month, branchId],
    queryFn: () => getPayrolls(month, branchId),
  });

  // ── Import Excel doanh số ─────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const importMut = useMutation({
    mutationFn: (file: File) => importSales(file, month, user?.employeeId ?? undefined),
    onSuccess: async (res) => {
      // Sau khi import doanh số xong → tự động tính lại bảng lương
      await generateBulk(month, branchId, user?.employeeId ?? undefined);
      qc.invalidateQueries({ queryKey: ['payrolls'] });
      alert(`${res.message}\nĐã tính lại bảng lương!`);
    },
  });

  // ── Finalize ──────────────────────────────────────────────────────────────────
  const finalizeMut = useMutation({
    mutationFn: (id: string) => finalizePayroll(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payrolls'] }),
  });

  // ── Edit modal ────────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState<Payroll | null>(null);
  const [editForm, setEditForm] = useState({
    leaveDays: 0, otHours: 0, otHolidayHours: 0,
    allowanceRate: 1, abcRating: '', note: '',
  });

  function openEdit(p: Payroll) {
    setEditing(p);
    setEditForm({
      leaveDays:      p.leaveDays      ?? 0,
      otHours:        p.otHours        ?? 0,
      otHolidayHours: p.otHolidayHours ?? 0,
      allowanceRate:  p.allowanceRate  ?? 1,
      abcRating:      p.abcRating      ?? '',
      note:           p.note           ?? '',
    });
    setDeductForm({ type: 'ADVANCE', amount: '', reason: '' });
  }

  const editMut = useMutation({
    mutationFn: () => updatePayroll(editing!.payrollId, {
      leaveDays:      editForm.leaveDays,
      otHours:        editForm.otHours,
      otHolidayHours: editForm.otHolidayHours,
      allowanceRate:  editForm.allowanceRate,
      abcRating:      editForm.abcRating || undefined,
      note:           editForm.note      || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payrolls'] });
      setEditing(null);
    },
  });

  // ── Deduction (inside edit modal) ────────────────────────────────────────────
  const [deductForm, setDeductForm] = useState({ type: 'ADVANCE', amount: '', reason: '' });

  const deductMut = useMutation({
    mutationFn: () => addDeduction({
      employeeId:  editing!.employeeId,
      type:        deductForm.type as 'ADVANCE' | 'PENALTY',
      amount:      Number(deductForm.amount),
      reason:      deductForm.reason,
      month,
      approvedById: user?.employeeId ?? undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payrolls'] });
      setDeductForm({ type: 'ADVANCE', amount: '', reason: '' });
      alert('Đã thêm khấu trừ. Bấm "Lưu & tính lại" để cập nhật lương.');
    },
  });

  // ── Payslip detail ────────────────────────────────────────────────────────────
  const [payslip, setPayslip] = useState<Payroll | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {canManage && (
            <>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) importMut.mutate(e.target.files[0]); }} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} loading={importMut.isPending}>
                <Upload size={14} /> Tải doanh số Excel
              </Button>
            </>
          )}
        </div>
        <Select options={monthOptions()} value={month}
          onChange={(e) => setMonth(e.target.value)} className="w-44 text-sm" />
      </div>

      <p className="text-xs text-gray-400">
        Cột Excel: A=Mã NV · B=Tên · C=Doanh số (VNĐ) · D=Ngày (YYYY-MM-DD) · E=Ca (HANH_CHINH / CA_SANG / CA_TOI) · F=Số SP
      </p>

      {/* Bảng lương */}
      {isLoading ? <PageSpinner /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nhân viên</TableTh>
              <TableTh>Ngày công</TableTh>
              <TableTh>Lương CB</TableTh>
              <TableTh>Phụ cấp</TableTh>
              <TableTh>OT</TableTh>
              <TableTh>Thưởng DS</TableTh>
              <TableTh>Thưởng ABC</TableTh>
              <TableTh>Khấu trừ</TableTh>
              <TableTh>Thực lĩnh</TableTh>
              <TableTh>TT</TableTh>
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {payrolls.map((p) => {
              const st = STATUS_MAP[p.status] ?? { label: p.status, variant: 'default' as const };
              return (
                <TableRow key={p.payrollId}>
                  <TableTd>
                    <p className="font-medium">{p.employeeName}</p>
                    <p className="text-xs text-gray-400">{p.employeeId}</p>
                  </TableTd>
                  <TableTd>
                    <span>{p.workDays}ngày</span>
                    {p.leaveDays > 0 && <span className="text-xs text-gray-400 ml-1">+{p.leaveDays}NP</span>}
                  </TableTd>
                  <TableTd>{formatCurrency(p.basePay)}</TableTd>
                  <TableTd>{formatCurrency(p.allowancePay)}</TableTd>
                  <TableTd>{p.overtimePay > 0 ? formatCurrency(p.overtimePay) : '—'}</TableTd>
                  <TableTd>{p.salesBonus > 0 ? formatCurrency(p.salesBonus) : '—'}</TableTd>
                  <TableTd>
                    {p.abcBonus > 0 ? (
                      <span className="text-xs">{p.abcRating && <Badge variant="info">{p.abcRating}</Badge>} {formatCurrency(p.abcBonus)}</span>
                    ) : '—'}
                  </TableTd>
                  <TableTd className="text-red-600">{p.deduction > 0 ? formatCurrency(p.deduction) : '—'}</TableTd>
                  <TableTd className="font-semibold text-indigo-700">{formatCurrency(p.netSalary)}</TableTd>
                  <TableTd><Badge variant={st.variant}>{st.label}</Badge></TableTd>
                  <TableTd>
                    <div className="flex gap-1.5 items-center">
                      <button onClick={() => setPayslip(p)} className="text-xs text-indigo-600 hover:underline">
                        Chi tiết
                      </button>
                      {canManage && p.status === 'DRAFT' && (
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-gray-700">
                          <Pencil size={12} />
                        </button>
                      )}
                      {isDirector && p.status === 'DRAFT' && (
                        <button
                          onClick={() => { if (confirm('Chốt bảng lương này?')) finalizeMut.mutate(p.payrollId); }}
                          className="cursor-pointer text-green-600 hover:text-green-700" title="Chốt lương">
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  </TableTd>
                </TableRow>
              );
            })}
            {payrolls.length === 0 && (
              <TableRow>
                <TableTd colSpan={11}>
                  <p className="text-center text-sm text-gray-400 py-8">
                    Chưa có bảng lương tháng {month}. Tải file Excel doanh số để tạo bảng lương.
                  </p>
                </TableTd>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* ── Modal: Chỉnh sửa ── */}
      {editing && (
        <Modal open onClose={() => setEditing(null)} title={`Chỉnh sửa — ${editing.employeeName}`} size="sm">
          <div className="space-y-4">

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Ngày nghỉ phép có lương (≤4)</label>
                <Input type="number" min={0} max={4} value={editForm.leaveDays}
                  onChange={(e) => setEditForm(f => ({ ...f, leaveDays: Number(e.target.value) }))}
                  className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Hệ số phụ cấp</label>
                <Select
                  options={[{value:'1',label:'100%'},{value:'0.75',label:'75%'},{value:'0.5',label:'50%'},{value:'0',label:'0%'}]}
                  value={String(editForm.allowanceRate)}
                  onChange={(e) => setEditForm(f => ({ ...f, allowanceRate: Number(e.target.value) }))}
                  className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Giờ OT thường</label>
                <Input type="number" min={0} step={0.5} value={editForm.otHours}
                  onChange={(e) => setEditForm(f => ({ ...f, otHours: Number(e.target.value) }))}
                  className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Giờ OT lễ/Tết (×3)</label>
                <Input type="number" min={0} step={0.5} value={editForm.otHolidayHours}
                  onChange={(e) => setEditForm(f => ({ ...f, otHolidayHours: Number(e.target.value) }))}
                  className="h-8 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Thưởng ABC</label>
              <Select options={ABC_OPTIONS} value={editForm.abcRating}
                onChange={(e) => setEditForm(f => ({ ...f, abcRating: e.target.value }))}
                className="h-8 text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Ghi chú</label>
              <Input value={editForm.note}
                onChange={(e) => setEditForm(f => ({ ...f, note: e.target.value }))}
                className="h-8 text-sm" placeholder="Tuỳ chọn..." />
            </div>

            {/* Thêm khấu trừ */}
            <div className="rounded-lg border border-dashed border-gray-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thêm khấu trừ (tạm ứng / phạt)</p>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  options={[{value:'ADVANCE',label:'Tạm ứng'},{value:'PENALTY',label:'Phạt'}]}
                  value={deductForm.type}
                  onChange={(e) => setDeductForm(f => ({ ...f, type: e.target.value }))}
                  className="h-8 text-sm" />
                <Input type="number" step={100000} min={0} placeholder="Số tiền (VNĐ)" value={deductForm.amount}
                  onChange={(e) => setDeductForm(f => ({ ...f, amount: e.target.value }))}
                  className="h-8 text-sm" />
              </div>
              <Input placeholder="Lý do..." value={deductForm.reason}
                onChange={(e) => setDeductForm(f => ({ ...f, reason: e.target.value }))}
                className="h-8 text-sm" />
              <button
                onClick={() => { if (deductForm.amount && deductForm.reason) deductMut.mutate(); }}
                disabled={!deductForm.amount || !deductForm.reason || deductMut.isPending}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-40">
                <Plus size={12} /> Thêm khấu trừ này
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setEditing(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                Huỷ
              </button>
              <Button size="sm" onClick={() => editMut.mutate()} loading={editMut.isPending}>
                <Check size={12} /> Lưu & tính lại
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Phiếu lương chi tiết ── */}
      {payslip && (
        <Modal open onClose={() => setPayslip(null)} title={`Phiếu lương — ${payslip.employeeName}`} size="sm">
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-2 flex justify-between">
              <span className="text-gray-500">Tháng</span>
              <span className="font-semibold">{payslip.month}</span>
            </div>

            <PayslipSection title="Ngày công & OT">
              <PayslipRow label="Ngày công thực tế"  value={`${payslip.workDays} ngày`} />
              <PayslipRow label="Nghỉ phép có lương" value={`${payslip.leaveDays} ngày`} />
              <PayslipRow label="Giờ OT thường"      value={`${payslip.otHours}h`} />
              <PayslipRow label="Giờ OT lễ/Tết"      value={`${payslip.otHolidayHours}h`} />
            </PayslipSection>

            <PayslipSection title="Thu nhập">
              <PayslipRow label={`Lương cơ bản (${(payslip.workDays ?? 0) + (payslip.leaveDays ?? 0)} ngày)`}
                value={formatCurrency(payslip.basePay)} />
              <PayslipRow label={`Phụ cấp (hệ số ×${payslip.allowanceRate})`} value={formatCurrency(payslip.allowancePay)} />
              <PayslipRow label="Lương OT"           value={formatCurrency(payslip.overtimePay)} />
              <PayslipRow label="Thưởng nóng DS"     value={formatCurrency(payslip.hotBonus)} />
              <PayslipRow label="Thưởng livestream"  value={formatCurrency(payslip.livestreamBonus)} />
              <PayslipRow label={`Thưởng ABC${payslip.abcRating ? ` (Hạng ${payslip.abcRating})` : ''}`}
                value={formatCurrency(payslip.abcBonus)} />
              <PayslipRow label="Tổng gross" value={formatCurrency(payslip.totalGross)} bold />
            </PayslipSection>

            <PayslipSection title="Khấu trừ">
              <PayslipRow label="BHXH/BHYT/BHTN (10.5%)" value={`− ${formatCurrency(payslip.bhxhEmployee)}`} red />
              <PayslipRow label="Thuế TNCN"              value={`− ${formatCurrency(payslip.tncn)}`}          red />
              <PayslipRow label="Tạm ứng"                value={`− ${formatCurrency(payslip.advance)}`}       red />
              <PayslipRow label="Phạt"                   value={`− ${formatCurrency(payslip.penalty)}`}       red />
            </PayslipSection>

            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Lương thực nhận</span>
              <span className="text-xl font-bold text-green-700">{formatCurrency(payslip.netSalary)}</span>
            </div>

            {payslip.note && (
              <p className="text-xs text-gray-400 text-center">Ghi chú: {payslip.note}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function PayslipSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-gray-100">
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 rounded-lg">
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-3 space-y-1.5">{children}</div>}
    </div>
  );
}

function PayslipRow({ label, value, bold, red }: { label: string; value: string; bold?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${red ? 'text-red-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}
