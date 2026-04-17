'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { getMyPayrolls } from '@/services/payroll.service';
import { PageSpinner, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import type { Payroll } from '@/types';

function PayslipSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-gray-100">
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 rounded-lg">
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-3 space-y-2">{children}</div>}
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

function PayslipCard({ p }: { p: Payroll }) {
  const [open, setOpen] = useState(false);
  const [mm, yy] = p.month.split('-');

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <FileText size={18} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">Tháng {parseInt(mm)}/{yy}</p>
            <p className="text-xs text-gray-400 mt-0.5">{p.workDays} ngày công · {p.status === 'FINALIZED' ? 'Đã chốt' : 'Nháp'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-700">{formatCurrency(p.netSalary)}</p>
            <p className="text-xs text-gray-400">Thực lĩnh</p>
          </div>
          <Badge variant={p.status === 'FINALIZED' ? 'success' : 'default'}>
            {p.status === 'FINALIZED' ? 'Đã chốt' : 'Nháp'}
          </Badge>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Detail */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
          <PayslipSection title="Ngày công & OT">
            <PayslipRow label="Ngày công thực tế"   value={`${p.workDays} ngày`} />
            <PayslipRow label="Nghỉ phép có lương"  value={`${p.leaveDays} ngày`} />
            <PayslipRow label="Giờ OT thường"        value={`${p.otHours}h`} />
            <PayslipRow label="Giờ OT lễ/Tết"        value={`${p.otHolidayHours}h`} />
          </PayslipSection>

          <PayslipSection title="Thu nhập">
            <PayslipRow label={`Lương cơ bản (${(p.workDays ?? 0) + (p.leaveDays ?? 0)} ngày)`}
              value={formatCurrency(p.basePay)} />
            <PayslipRow label={`Phụ cấp (hệ số ×${p.allowanceRate})`} value={formatCurrency(p.allowancePay)} />
            <PayslipRow label="Lương OT"            value={formatCurrency(p.overtimePay)} />
            <PayslipRow label="Thưởng nóng DS"      value={formatCurrency(p.hotBonus)} />
            <PayslipRow label="Thưởng livestream"   value={formatCurrency(p.livestreamBonus)} />
            <PayslipRow label={`Thưởng ABC${p.abcRating ? ` (Hạng ${p.abcRating})` : ''}`}
              value={formatCurrency(p.abcBonus)} />
            <PayslipRow label="Tổng gross" value={formatCurrency(p.totalGross)} bold />
          </PayslipSection>

          <PayslipSection title="Khấu trừ">
            <PayslipRow label="BHXH/BHYT/BHTN (10.5%)" value={`− ${formatCurrency(p.bhxhEmployee)}`} red />
            <PayslipRow label="Thuế TNCN"               value={`− ${formatCurrency(p.tncn)}`}         red />
            <PayslipRow label="Tạm ứng"                 value={`− ${formatCurrency(p.advance)}`}       red />
            <PayslipRow label="Phạt"                    value={`− ${formatCurrency(p.penalty)}`}        red />
          </PayslipSection>

          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Lương thực nhận</span>
            <span className="text-xl font-bold text-indigo-700">{formatCurrency(p.netSalary)}</span>
          </div>

          {p.note && (
            <p className="text-xs text-gray-400 text-center">Ghi chú: {p.note}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyPayslipPage() {
  const { user } = useAuth();

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ['my-payrolls', user?.employeeId],
    queryFn: () => getMyPayrolls(user!.employeeId!),
    enabled: !!user?.employeeId,
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Phiếu lương của tôi</h2>
        <p className="text-sm text-gray-400 mt-0.5">Lịch sử lương cá nhân — bấm vào từng tháng để xem chi tiết</p>
      </div>

      {payrolls.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
          <FileText size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Chưa có phiếu lương nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payrolls.map((p) => <PayslipCard key={p.payrollId} p={p} />)}
        </div>
      )}
    </div>
  );
}
