'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { FileText, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { getContracts, getExpiringContracts } from '@/services/contract.service';
import { getPayrolls } from '@/services/payroll.service';
import { getBranches, getEmployees } from '@/services/employee.service';
import { getCandidates } from '@/services/recruitment.service';
import { getTodayAttendance } from '@/services/attendance.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageSpinner, Badge } from '@/components/ui';

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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CONTRACT_STATUS: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }> = {
  ACTIVE:     { label: 'Hiệu lực',  variant: 'success' },
  DRAFT:      { label: 'Nháp',      variant: 'default' },
  PENDING:    { label: 'Chờ duyệt', variant: 'warning' },
  REJECTED:   { label: 'Từ chối',   variant: 'danger'  },
  TERMINATED: { label: 'Chấm dứt',  variant: 'danger'  },
  EXPIRED:    { label: 'Hết hạn',   variant: 'info'    },
};

type Tab = 'hr' | 'contract' | 'payroll';

export default function ReportsPage() {
  const [tab, setTab]     = useState<Tab>('hr');
  const [month, setMonth] = useState(thisMonth());

  const { data: branches = [] } = useQuery({ queryKey: ['branches'], queryFn: getBranches });

  // ── Nhân sự ────────────────────────────────────────────────────
  const { data: empPages, isLoading: loadingEmp } = useQuery({
    queryKey: ['report-employees'],
    queryFn: () => getEmployees({ pageSize: 200 }),
    enabled: tab === 'hr',
  });
  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ['report-candidates'],
    queryFn: () => getCandidates({ pageSize: 200 }),
    enabled: tab === 'hr',
  });
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['report-today-attendance'],
    queryFn: () => getTodayAttendance(),
    enabled: tab === 'hr',
    refetchInterval: 30_000,
  });

  // ── Hợp đồng ───────────────────────────────────────────────────
  const { data: contracts = [], isLoading: loadingContracts } = useQuery({
    queryKey: ['report-contracts'],
    queryFn: () => getContracts({}),
    enabled: tab === 'contract',
  });
  const { data: expiring = [] } = useQuery({
    queryKey: ['report-expiring'],
    queryFn: () => getExpiringContracts(60),
    enabled: tab === 'contract',
  });

  // ── Lương ──────────────────────────────────────────────────────
  const { data: payrolls = [], isLoading: loadingPayroll } = useQuery({
    queryKey: ['report-payroll', month],
    queryFn: () => getPayrolls(month),
    enabled: tab === 'payroll',
  });

  // ── Aggregations ───────────────────────────────────────────────
  const employees    = empPages?.data ?? [];
  const activeEmps   = employees.filter(e => e.status === 'ACTIVE');
  const empByBranch  = branches.map(b => ({
    name:  b.branchName.replace('Chi nhánh ', ''),
    value: activeEmps.filter(e => e.branchId === b.branchId).length,
  }));

  const activeCandidates = candidates?.data?.filter(
    c => !['rejected','hired'].includes(c.status?.toLowerCase() ?? '')
  ) ?? [];

  const contractByStatus = Object.entries(
    contracts.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const contractByBranch = branches.map(b => ({
    name:   b.branchName.replace('Chi nhánh ', ''),
    active: contracts.filter(c => c.branchId === b.branchId && c.status === 'ACTIVE').length,
    other:  contracts.filter(c => c.branchId === b.branchId && c.status !== 'ACTIVE').length,
  }));

  const totalPayroll = payrolls.reduce((s, p) => s + (p.netSalary   || 0), 0);
  const totalGross   = payrolls.reduce((s, p) => s + (p.totalGross  || 0), 0);
  const totalDeduct  = payrolls.reduce((s, p) => s + (p.deduction   || 0), 0);
  const avgSalary    = payrolls.length ? totalPayroll / payrolls.length : 0;

  const payrollByBranch = branches.map(b => {
    const list = payrolls.filter(p => p.branchId === b.branchId);
    return { name: b.branchName.replace('Chi nhánh ', ''), tongQuy: list.reduce((s, p) => s + (p.netSalary || 0), 0), soNV: list.length };
  }).filter(b => b.soNV > 0);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'hr',       label: 'Nhân sự',   icon: Users    },
    { key: 'contract', label: 'Hợp đồng',  icon: FileText },
    { key: 'payroll',  label: 'Lương',     icon: DollarSign },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── NHÂN SỰ ── */}
      {tab === 'hr' && (
        (loadingEmp || loadingCandidates) ? <PageSpinner /> : (
          <div className="space-y-4">
            {/* Tổng quan */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Tổng nhân viên"       value={activeEmps.length}           sub="đang làm việc"    color="indigo" />
              <SummaryCard label="Chi nhánh"             value={branches.length}              sub="chi nhánh"        color="green"  />
              <SummaryCard label="Ứng viên đang xử lý"  value={activeCandidates.length}      sub="chưa hoàn tất"    color="amber"  />
              <SummaryCard label="Tổng ứng viên"         value={candidates?.total ?? 0}       sub="toàn thời gian"   color="violet" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* NV theo chi nhánh — pie chart */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Nhân viên theo chi nhánh</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={empByBranch} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                      {empByBranch.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Đang làm việc hôm nay */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Đang làm việc hôm nay</h3>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {todayAttendance.filter(e => e.status !== 'NOT_IN' && e.status !== 'DONE').length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Chưa có ai check-in hôm nay</p>
                  ) : (
                    todayAttendance
                      .filter(e => e.status !== 'NOT_IN' && e.status !== 'DONE')
                      .map(e => (
                        <div key={e.employeeId} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{e.employeeName}</p>
                            <p className="text-xs text-gray-400">{e.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono text-green-600">{e.checkInTime ? new Date(e.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                            <p className={`text-[10px] ${e.status === 'LATE' ? 'text-amber-500' : 'text-green-500'}`}>
                              {e.status === 'LATE' ? 'Đi trễ' : 'Đúng giờ'}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Đang làm: <strong className="text-green-600">{todayAttendance.filter(e => e.status !== 'NOT_IN' && e.status !== 'DONE').length}</strong></span>
                  <span>Đã về: <strong className="text-indigo-600">{todayAttendance.filter(e => e.status === 'DONE').length}</strong></span>
                  <span>Chưa vào: <strong className="text-gray-500">{todayAttendance.filter(e => e.status === 'NOT_IN').length}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── HỢP ĐỒNG ── */}
      {tab === 'contract' && (
        loadingContracts ? <PageSpinner /> : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Tổng hợp đồng"   value={contracts.length}                                        sub="toàn công ty"    color="indigo" />
              <SummaryCard label="Đang hiệu lực"   value={contracts.filter(c => c.status === 'ACTIVE').length}      sub="hợp đồng"        color="green"  />
              <SummaryCard label="Sắp hết hạn"     value={expiring.length}                                         sub="trong 60 ngày"   color="amber"  />
              <SummaryCard label="Chấm dứt/Hết hạn" value={contracts.filter(c => ['TERMINATED','EXPIRED'].includes(c.status)).length} sub="hợp đồng" color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Theo trạng thái */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Phân loại theo trạng thái</h3>
                <div className="space-y-3">
                  {contractByStatus.map(([status, count]) => {
                    const st = CONTRACT_STATUS[status] ?? { label: status, variant: 'default' as const };
                    const pct = Math.round((count / contracts.length) * 100);
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className="w-28 shrink-0"><Badge variant={st.variant}>{st.label}</Badge></div>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Theo chi nhánh */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Hiệu lực theo chi nhánh</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={contractByBranch} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v, n) => [v, n === 'active' ? 'Hiệu lực' : 'Khác']} />
                    <Bar dataKey="active" name="Hiệu lực" fill="#6366f1" radius={[4,4,0,0]} stackId="a" />
                    <Bar dataKey="other"  name="Khác"     fill="#e0e7ff" radius={[4,4,0,0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sắp hết hạn */}
            {expiring.length > 0 && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
                <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} /> {expiring.length} hợp đồng sắp hết hạn trong 60 ngày tới
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {expiring.map(c => {
                    const daysLeft = Math.ceil((new Date(c.endDate!).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={c.contractId} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-100">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.employeeName}</p>
                          <p className="text-xs text-gray-400">{c.branchName} · hết {formatDate(c.endDate!)}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysLeft <= 15 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          Còn {daysLeft} ngày
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* ── LƯƠNG ── */}
      {tab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Tháng:</label>
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400">
              {monthOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loadingPayroll ? <PageSpinner /> : payrolls.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">Chưa có dữ liệu lương tháng {month}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard label="Tổng gross"       value={formatCurrency(totalGross)}   sub="trước khấu trừ"  color="indigo" />
                <SummaryCard label="Tổng khấu trừ"    value={formatCurrency(totalDeduct)}  sub="BHXH + thuế + khác" color="red" />
                <SummaryCard label="Tổng thực chi"    value={formatCurrency(totalPayroll)} sub="thực lĩnh"       color="green"  />
                <SummaryCard label="Lương trung bình" value={formatCurrency(avgSalary)}    sub={`${payrolls.length} nhân viên`} color="violet" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Biểu đồ theo chi nhánh */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Quỹ lương theo chi nhánh</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={payrollByBranch} barSize={36}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Quỹ lương']} />
                      <Bar dataKey="tongQuy" radius={[4,4,0,0]}>
                        {payrollByBranch.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {payrollByBranch.map((b, i) => (
                      <div key={b.name} className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: COLORS[i] }} />
                          {b.name} ({b.soNV} NV)
                        </span>
                        <span className="font-medium text-gray-700">{formatCurrency(b.tongQuy)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chi tiết từng nhân viên */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết nhân viên</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {[...payrolls].sort((a, b) => b.netSalary - a.netSalary).map(p => (
                      <div key={p.payrollId} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{p.employeeName}</p>
                          <p className="text-xs text-gray-400">{p.branchName ?? p.branchId} · {p.workDays} ngày công</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-indigo-700">{formatCurrency(p.netSalary)}</p>
                          {p.salesBonus > 0 && <p className="text-xs text-green-600">+{formatCurrency(p.salesBonus)} DS</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100'  },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100'  },
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100'    },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  };
  const c = colors[color] ?? colors.indigo;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} px-5 py-4`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
