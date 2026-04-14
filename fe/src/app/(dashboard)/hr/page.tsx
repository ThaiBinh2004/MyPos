'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, FileText, UserPlus, ShoppingCart, Clock, TrendingUp, Building2, MapPin } from 'lucide-react';
import { getEmployees, getBranches } from '@/services/employee.service';
import { getAttendanceRecords } from '@/services/attendance.service';
import { getOrders } from '@/services/sales.service';
import { getContracts } from '@/services/contract.service';
import { getCandidates } from '@/services/recruitment.service';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function HrDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: employees } = useQuery({
    queryKey: ['employees', {}],
    queryFn: () => getEmployees({ page: 1, pageSize: 1 }),
  });
  const { data: contracts } = useQuery({
    queryKey: ['contracts-all'],
    queryFn: () => getContracts({ page: 1, pageSize: 100 }),
  });
  const { data: attendance } = useQuery({
    queryKey: ['attendance-today', today],
    queryFn: () => getAttendanceRecords({ page: 1, pageSize: 100, dateFrom: today, dateTo: today }),
  });
  const { data: candidates } = useQuery({
    queryKey: ['candidates', {}],
    queryFn: () => getCandidates({ page: 1, pageSize: 100 }),
  });
  const { data: ordersToday } = useQuery({
    queryKey: ['orders-today', today],
    queryFn: () => getOrders({ page: 1, pageSize: 100, dateFrom: today, dateTo: today }),
  });
  const { data: ordersMonth } = useQuery({
    queryKey: ['orders-month'],
    queryFn: () => getOrders({ page: 1, pageSize: 1000 }),
  });
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const expiringContracts = contracts?.data?.filter((c) => {
    if (!c.endDate) return false;
    const diff = (new Date(c.endDate).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 60;
  }).length ?? 0;

  const activeCandidates = candidates?.data?.filter(
    (c) => !['rejected', 'hired'].includes(c.status?.toLowerCase() ?? '')
  ).length ?? 0;

  const monthRevenue = ordersMonth?.data
    ?.filter((o) => o.status?.toLowerCase() === 'completed')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0) ?? 0;

  const stats = [
    {
      label: 'Tổng nhân viên',
      value: employees?.total ?? '—',
      sub: `${branches?.length ?? 0} chi nhánh`,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Chấm công hôm nay',
      value: attendance?.total ?? '—',
      sub: 'lượt check-in',
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'HĐ sắp hết hạn',
      value: expiringContracts,
      sub: 'trong 60 ngày tới',
      icon: FileText,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Ứng viên đang xử lý',
      value: activeCandidates,
      sub: 'chưa hoàn tất',
      icon: UserPlus,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Đơn hàng hôm nay',
      value: ordersToday?.total ?? '—',
      sub: 'đơn',
      icon: ShoppingCart,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: `Doanh thu tháng ${currentMonth}`,
      value: monthRevenue > 0 ? formatCurrency(monthRevenue) : '—',
      sub: `năm ${currentYear}`,
      icon: TrendingUp,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          {format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}
        </p>
      </div>

      {/* Stat cards — 3 cols */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400 truncate">{s.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-800 leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Chi nhánh — 2/5 */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <Building2 size={14} className="text-indigo-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700">Chi nhánh</h2>
            <span className="ml-auto text-xs font-medium text-slate-400">{branches?.length ?? 0} chi nhánh</span>
          </div>
          <div className="space-y-2">
            {branches?.map((b) => (
              <div key={b.branchId} className="rounded-lg border border-gray-50 bg-slate-50/60 px-3.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{b.branchName}</p>
                  <span className="shrink-0 rounded-md bg-white border border-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                    {b.branchId}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} />
                  {b.address}
                </div>
              </div>
            )) ?? <p className="text-sm text-slate-400">Chưa có dữ liệu</p>}
          </div>
        </div>

        {/* Chấm công hôm nay — 3/5 */}
        <div className="lg:col-span-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
              <Clock size={14} className="text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-700">Chấm công hôm nay</h2>
            {(attendance?.total ?? 0) > 0 && (
              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {attendance?.total} lượt
              </span>
            )}
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {attendance?.data?.length ? (
              attendance.data.map((r) => (
                <div key={r.attendanceId} className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 hover:bg-slate-50 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {r.employeeName?.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.employeeName}</p>
                    <p className="text-xs text-slate-400">{r.employeeId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-medium text-slate-600">
                      {r.checkInTime?.substring(11, 16) ?? '—'}
                    </span>
                    <span className="mx-1 text-xs text-slate-300">→</span>
                    <span className="text-xs font-mono font-medium text-slate-600">
                      {r.checkOutTime?.substring(11, 16) ?? '...'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock size={28} className="text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">Chưa có dữ liệu hôm nay</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
