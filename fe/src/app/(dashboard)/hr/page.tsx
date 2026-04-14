'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, FileText, UserPlus, ShoppingCart, Clock, TrendingUp } from 'lucide-react';
import { getEmployees, getBranches } from '@/services/employee.service';
import { getAttendanceRecords } from '@/services/attendance.service';
import { getOrders } from '@/services/sales.service';
import { getContracts } from '@/services/contract.service';
import { getCandidates } from '@/services/recruitment.service';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
}

export default function HrDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: employees } = useQuery({
    queryKey: ['employees', {}],
    queryFn: () => getEmployees({ page: 1, pageSize: 1 }),
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts-expiring'],
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
    queryKey: ['orders-month', currentMonth, currentYear],
    queryFn: () => getOrders({ page: 1, pageSize: 1000 }),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const totalEmployees = employees?.total ?? '—';
  const checkedInToday = attendance?.total ?? '—';
  const activeCandidates = candidates?.data?.filter(
    (c) => !['rejected', 'hired'].includes(c.status?.toLowerCase())
  ).length ?? '—';
  const expiringContracts = contracts?.data?.filter((c) => {
    if (!c.endDate) return false;
    const end = new Date(c.endDate);
    const diff = (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 60;
  }).length ?? '—';

  const todayOrderCount = ordersToday?.total ?? '—';
  const monthRevenue = ordersMonth?.data
    ?.filter((o) => o.status?.toLowerCase() === 'completed')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Ngày {format(new Date(), 'dd/MM/yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Tổng nhân viên" value={totalEmployees} sub={`${branches?.length ?? 0} chi nhánh`} icon={Users} color="text-blue-600" />
        <StatCard title="Chấm công hôm nay" value={checkedInToday} sub="lượt check-in" icon={Clock} color="text-teal-600" />
        <StatCard title="HĐ sắp hết hạn" value={expiringContracts} sub="trong 60 ngày tới" icon={FileText} color="text-yellow-600" />
        <StatCard title="Ứng viên đang xử lý" value={activeCandidates} sub="chưa hoàn tất" icon={UserPlus} color="text-purple-600" />
        <StatCard title="Đơn hàng hôm nay" value={todayOrderCount} sub="đơn" icon={ShoppingCart} color="text-green-600" />
        <StatCard title="Doanh thu tháng" value={monthRevenue > 0 ? formatCurrency(monthRevenue) : '—'} sub={`Tháng ${currentMonth}/${currentYear}`} icon={TrendingUp} color="text-rose-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Chi nhánh</h2>
          {branches?.length ? (
            <ul className="space-y-2">
              {branches.map((b) => (
                <li key={b.branchId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-800">{b.branchName}</span>
                  <span className="text-xs text-gray-500">{b.branchId}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Chấm công hôm nay</h2>
          {attendance?.data?.length ? (
            <ul className="space-y-2 max-h-52 overflow-y-auto">
              {attendance.data.map((r) => (
                <li key={r.attendanceId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-800">{r.employeeName}</span>
                  <span className="text-xs text-gray-500">
                    {r.checkInTime ? r.checkInTime.substring(11, 16) : '—'} →{' '}
                    {r.checkOutTime ? r.checkOutTime.substring(11, 16) : '...'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Chưa có dữ liệu hôm nay</p>
          )}
        </div>
      </div>
    </div>
  );
}
