'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayAttendance, checkin, checkout } from '@/services/attendance.service';
import type { TodayAttendance } from '@/types';
import { CheckCircle, XCircle, Clock, LogIn, LogOut } from 'lucide-react';


function formatTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length === 1 ? parts[0][0] : (parts[0][0] + parts[parts.length - 1][0]);
}

type Mode = 'list' | 'auth' | 'success' | 'error';

export default function KioskPage() {
  const qc = useQueryClient();
  const [branchId] = useState<string | undefined>(undefined); // có thể lấy từ URL param sau
  const [now, setNow] = useState(new Date());
  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<TodayAttendance | null>(null);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [resultMsg, setResultMsg] = useState('');
  const [resultTime, setResultTime] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [search, setSearch] = useState('');

  // Cập nhật đồng hồ mỗi giây
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: employees = [], refetch } = useQuery({
    queryKey: ['kiosk-today', branchId],
    queryFn: () => getTodayAttendance(branchId),
    refetchInterval: 30_000, // tự làm mới mỗi 30s
  });

  const checkinMut = useMutation({
    mutationFn: () => checkin(selected!.employeeId, password),
    onSuccess: (data) => {
      setResultMsg(`${data.employeeName} — Check-in thành công!`);
      setResultTime(formatTime(data.checkInTime) ?? '');
      setIsSuccess(true);
      setMode('success');
      refetch();
      setTimeout(resetToList, 3000);
    },
    onError: (err: any) => {
      setPwError(err?.response?.data ?? 'Mật khẩu không đúng!');
    },
  });

  const checkoutMut = useMutation({
    mutationFn: () => checkout(selected!.employeeId, password),
    onSuccess: (data) => {
      setResultMsg(`${data.employeeName} — Check-out thành công!`);
      setResultTime(formatTime(data.checkOutTime) ?? '');
      setIsSuccess(true);
      setMode('success');
      refetch();
      setTimeout(resetToList, 3000);
    },
    onError: (err: any) => {
      setPwError(err?.response?.data ?? 'Mật khẩu không đúng!');
    },
  });

  function resetToList() {
    setMode('list');
    setSelected(null);
    setPassword('');
    setPwError('');
  }

  function handleSelect(emp: TodayAttendance) {
    if (emp.status === 'DONE') return; // đã về, không cho thao tác
    setSelected(emp);
    setPassword('');
    setPwError('');
    setMode('auth');
  }

  function handleConfirm() {
    if (!password) { setPwError('Vui lòng nhập mật khẩu'); return; }
    if (selected?.status === 'NOT_IN') checkinMut.mutate();
    else checkoutMut.mutate();
  }

  const isPending = checkinMut.isPending || checkoutMut.isPending;
  const filtered = employees.filter((e) =>
    e.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  // Group: chưa vào / đang làm / đã về
  const notIn  = filtered.filter((e) => e.status === 'NOT_IN');
  const atWork = filtered.filter((e) => e.status !== 'NOT_IN' && e.status !== 'DONE');
  const done   = filtered.filter((e) => e.status === 'DONE');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-800">
        <div>
          <p className="text-2xl font-bold tracking-wide text-white">FORHER</p>
          <p className="text-xs text-gray-400 mt-0.5">Hệ thống chấm công</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-semibold tabular-nums text-white">
            {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 px-8 py-6 overflow-auto">

        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhân viên..."
            className="w-64 rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
          <div className="flex gap-4 text-xs text-gray-400 ml-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />{notIn.length} chưa vào</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{atWork.length} đang làm</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />{done.length} đã về</span>
          </div>
        </div>

        {/* Đang làm */}
        {atWork.length > 0 && (
          <Section title="Đang làm việc">
            {atWork.map((emp) => <EmployeeCard key={emp.employeeId} emp={emp} onClick={() => handleSelect(emp)} />)}
          </Section>
        )}

        {/* Chưa vào */}
        {notIn.length > 0 && (
          <Section title="Chưa vào ca">
            {notIn.map((emp) => <EmployeeCard key={emp.employeeId} emp={emp} onClick={() => handleSelect(emp)} />)}
          </Section>
        )}

        {/* Đã về */}
        {done.length > 0 && (
          <Section title="Đã kết thúc ca">
            {done.map((emp) => <EmployeeCard key={emp.employeeId} emp={emp} onClick={() => {}} />)}
          </Section>
        )}

        {employees.length === 0 && (
          <div className="flex flex-col items-center justify-center h-60 text-gray-500">
            <Clock size={40} className="mb-3 opacity-40" />
            <p>Chưa có dữ liệu nhân viên hôm nay</p>
          </div>
        )}
      </div>

      {/* Auth overlay */}
      {mode === 'auth' && selected && (
        <Overlay onClose={resetToList}>
          <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm space-y-5 shadow-2xl border border-gray-700">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
                {getInitials(selected.employeeName)}
              </div>
              <p className="text-lg font-semibold text-white">{selected.employeeName}</p>
              {selected.position && <p className="text-xs text-gray-400">{selected.position}</p>}
              <span className={`mt-1 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                selected.status === 'NOT_IN' ? 'bg-gray-700 text-gray-300' : 'bg-green-900 text-green-300'
              }`}>
                {selected.status === 'NOT_IN'
                  ? <><LogIn size={11} /> Check-in</>
                  : <><LogOut size={11} /> Check-out · Vào lúc {formatTime(selected.checkInTime)}</>}
              </span>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder="Nhập mật khẩu của bạn"
                autoFocus
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {pwError && <p className="text-xs text-red-400 mt-1.5">{pwError}</p>}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Đang xử lý...' : selected.status === 'NOT_IN' ? 'Xác nhận Check-in' : 'Xác nhận Check-out'}
            </button>
            <button onClick={resetToList} className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Huỷ
            </button>
          </div>
        </Overlay>
      )}

      {/* Result overlay */}
      {mode === 'success' && (
        <Overlay onClose={resetToList}>
          <div className="bg-gray-900 rounded-2xl p-10 w-full max-w-sm text-center space-y-4 border border-gray-700 shadow-2xl">
            <CheckCircle size={56} className="mx-auto text-green-400" />
            <p className="text-xl font-bold text-white">{resultMsg}</p>
            <p className="text-3xl font-mono font-semibold text-green-400">{resultTime}</p>
            <p className="text-xs text-gray-500">Tự động đóng sau 3 giây...</p>
          </div>
        </Overlay>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {children}
      </div>
    </div>
  );
}

function EmployeeCard({ emp, onClick }: { emp: TodayAttendance; onClick: () => void }) {
  const isDone   = emp.status === 'DONE';
  const isAtWork = emp.status !== 'NOT_IN' && emp.status !== 'DONE';
  const isLate   = emp.status === 'LATE';

  return (
    <button
      onClick={onClick}
      disabled={isDone}
      className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all text-center
        ${isDone
          ? 'border-gray-800 bg-gray-900 opacity-50 cursor-default'
          : isAtWork
          ? 'border-green-800 bg-green-950 hover:bg-green-900 hover:border-green-600 cursor-pointer'
          : 'border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 cursor-pointer'
        }`}
    >
      {/* Status dot */}
      <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
        isDone ? 'bg-indigo-400' : isAtWork ? 'bg-green-400' : 'bg-gray-500'
      }`} />

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
        isDone ? 'bg-gray-700 text-gray-400' : isAtWork ? 'bg-green-700 text-white' : 'bg-gray-600 text-white'
      }`}>
        {getInitials(emp.employeeName)}
      </div>

      <div className="min-w-0 w-full">
        <p className="text-xs font-semibold text-white truncate">{emp.employeeName}</p>
        {emp.defaultShift && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: emp.defaultShift === 'CA_SANG' ? '#86efac' : emp.defaultShift === 'CA_TOI' ? '#c4b5fd' : '#94a3b8' }}>
            {emp.defaultShift === 'HANH_CHINH' ? 'HC 9–18' : emp.defaultShift === 'CA_SANG' ? 'Ca sáng 7–15' : 'Ca tối 15–23'}
          </p>
        )}
      </div>

      {/* Time info */}
      <div className="text-[10px] text-gray-400 w-full space-y-0.5">
        {emp.checkInTime && <p className="text-green-400">Vào: {formatTime(emp.checkInTime)}</p>}
        {emp.checkOutTime && <p className="text-indigo-400">Ra: {formatTime(emp.checkOutTime)}</p>}
        {isLate && <p className="text-amber-400">Đi trễ</p>}
        {!emp.checkInTime && !isDone && (
          <p className="flex items-center justify-center gap-1 text-gray-500">
            <LogIn size={9} /> Check-in
          </p>
        )}
      </div>
    </button>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}
