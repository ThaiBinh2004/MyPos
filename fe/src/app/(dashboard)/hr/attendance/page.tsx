'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Monitor, ClipboardList, Check, X, Plus, CalendarDays } from 'lucide-react';
import {
  getAttendanceRecords, getCorrections, getMyCorrections,
  reviewCorrection, requestCorrection,
} from '@/services/attendance.service';
import { getEmployees, updateEmployeeShift } from '@/services/employee.service';
import {
  Badge, Table, TableHead, TableBody, TableRow, TableTh, TableTd,
  PageSpinner, Select, Modal, Input, Button,
} from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import type { AttendanceFilters, AttendanceRecord, CorrectionPayload } from '@/types';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info' }> = {
  ON_TIME:         { label: 'Đúng giờ',     variant: 'success' },
  LATE:            { label: 'Đi trễ',        variant: 'warning' },
  EARLY_LEAVE:     { label: 'Về sớm',        variant: 'warning' },
  ABSENT:          { label: 'Vắng',          variant: 'danger'  },
  MISSING_CHECKOUT:{ label: 'Quên checkout', variant: 'info'    },
  CORRECTED:       { label: 'Đã điều chỉnh', variant: 'default' },
  PRESENT:         { label: 'Đúng giờ',      variant: 'success' },
};

export default function AttendancePage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isDirector = user?.role === 'director';
  const isManager  = user?.role === 'branch_manager';
  const isEmployee = !isDirector && !isManager;

  const [tab, setTab] = useState<'records' | 'corrections' | 'shifts'>('records');
  const [filters, setFilters] = useState<AttendanceFilters>({
    branchId: isManager ? (user?.branchId ?? undefined) : undefined,
    search: isEmployee ? (user?.employeeId ?? undefined) : undefined,
  });

  // Correction request form state
  const [openCorrForm, setOpenCorrForm] = useState(false);
  const [corrRecord, setCorrRecord] = useState<AttendanceRecord | null>(null);
  const [corrReason, setCorrReason] = useState('');
  const [corrCheckIn, setCorrCheckIn] = useState('');
  const [corrCheckOut, setCorrCheckOut] = useState('');

  // Review state
  const [reviewNote, setReviewNote] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const { data: employeePages, isLoading: loadingShifts } = useQuery({
    queryKey: ['employees-shifts', isManager ? user?.branchId : undefined],
    queryFn: () => getEmployees({ branchId: isManager ? user?.branchId ?? undefined : undefined, pageSize: 200 }),
    enabled: tab === 'shifts',
  });
  const shiftEmployees = employeePages?.data ?? [];

  const shiftMut = useMutation({
    mutationFn: ({ id, shift }: { id: string; shift: string }) => updateEmployeeShift(id, shift),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees-shifts'] }),
  });

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => getAttendanceRecords(filters),
    enabled: tab === 'records',
  });

  const corrQuery = isEmployee
    ? { queryKey: ['my-corrections', user?.employeeId], queryFn: () => getMyCorrections(user!.employeeId!) }
    : { queryKey: ['corrections', isManager ? user?.branchId : undefined],
        queryFn: () => getCorrections({ branchId: isManager ? user?.branchId ?? undefined : undefined }) };

  const { data: corrections = [], isLoading: loadingCorrections } = useQuery({
    ...corrQuery,
    enabled: tab === 'corrections',
  } as any);

  const reviewMut = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: 'APPROVED' | 'REJECTED'; note?: string }) =>
      reviewCorrection(id, status, user?.employeeId ?? '', note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corrections'] });
      setReviewingId(null);
      setReviewNote('');
    },
  });

  const corrMut = useMutation({
    mutationFn: (payload: CorrectionPayload) => requestCorrection(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-corrections'] });
      setOpenCorrForm(false);
      setCorrRecord(null);
      setCorrReason('');
      setCorrCheckIn('');
      setCorrCheckOut('');
    },
  });

  function openCorrectionForm(record?: AttendanceRecord) {
    setCorrRecord(record ?? null);
    setCorrReason('');
    setCorrCheckIn(record?.checkInTime ? record.checkInTime.slice(0, 16) : '');
    setCorrCheckOut(record?.checkOutTime ? record.checkOutTime.slice(0, 16) : '');
    setOpenCorrForm(true);
  }

  function submitCorrection() {
    if (!corrReason.trim()) return;
    corrMut.mutate({
      employeeId: user!.employeeId!,
      attendanceId: corrRecord?.attendanceId,
      requestedCheckIn:  corrCheckIn  ? corrCheckIn  + ':00' : undefined,
      requestedCheckOut: corrCheckOut ? corrCheckOut + ':00' : undefined,
      reason: corrReason,
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'records',     label: 'Bảng chấm công', icon: Monitor },
          { key: 'corrections', label: 'Đơn sửa công',   icon: ClipboardList },
          ...(!isEmployee ? [{ key: 'shifts', label: 'Ca làm việc', icon: CalendarDays }] : []),
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
        {isEmployee && (
          <div className="ml-auto flex items-center pb-1">
            <Button size="sm" onClick={() => openCorrectionForm()}>
              <Plus size={13} /> Gửi đơn sửa công
            </Button>
          </div>
        )}
      </div>

      {/* Records tab */}
      {tab === 'records' && (
        <>
          <div className="flex flex-wrap gap-2">
            <input type="date" defaultValue={today}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            <input type="date" defaultValue={today}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            <Select
              options={Object.entries(STATUS_MAP).map(([v, { label }]) => ({ value: v, label }))}
              placeholder="Tất cả trạng thái"
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
              className="w-44" />
            {!isEmployee && (
              <Input placeholder="Tìm tên hoặc mã NV..."
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
                className="h-9 w-44 text-sm" />
            )}
          </div>

          {loadingRecords ? <PageSpinner /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Nhân viên</TableTh>
                  <TableTh>Ngày</TableTh>
                  <TableTh>Giờ vào</TableTh>
                  <TableTh>Giờ ra</TableTh>
                  <TableTh>Tổng giờ</TableTh>
                  <TableTh>Trạng thái</TableTh>
                  {isEmployee && <TableTh />}
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r) => {
                  const st = STATUS_MAP[r.status?.toUpperCase()] ?? { label: r.status, variant: 'default' as const };
                  return (
                    <TableRow key={r.attendanceId}>
                      <TableTd>
                        <p className="font-medium">{r.employeeName}</p>
                        <p className="text-xs text-gray-400">{r.employeeId}</p>
                      </TableTd>
                      <TableTd>{formatDate(r.dateWork)}</TableTd>
                      <TableTd>{r.checkInTime  ? formatDateTime(r.checkInTime)  : '—'}</TableTd>
                      <TableTd>{r.checkOutTime ? formatDateTime(r.checkOutTime) : <span className="text-amber-500 text-xs">Chưa ra</span>}</TableTd>
                      <TableTd>{r.totalHours != null ? `${r.totalHours}h` : '—'}</TableTd>
                      <TableTd><Badge variant={st.variant}>{st.label}</Badge></TableTd>
                      {isEmployee && (
                        <TableTd>
                          <button onClick={() => openCorrectionForm(r)}
                            className="text-xs text-indigo-600 hover:underline">
                            Sửa công
                          </button>
                        </TableTd>
                      )}
                    </TableRow>
                  );
                })}
                {records.length === 0 && (
                  <TableRow>
                    <TableTd colSpan={isEmployee ? 8 : 7}>
                      <p className="text-center text-sm text-gray-400 py-6">Chưa có dữ liệu chấm công.</p>
                    </TableTd>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {/* Corrections tab */}
      {tab === 'corrections' && (
        loadingCorrections ? <PageSpinner /> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Nhân viên</TableTh>
                <TableTh>Ngày gửi</TableTh>
                <TableTh>Giờ xin sửa</TableTh>
                <TableTh>Lý do</TableTh>
                <TableTh>Trạng thái</TableTh>
                {!isEmployee && <TableTh />}
              </TableRow>
            </TableHead>
            <TableBody>
              {(corrections as any[]).map((c: any) => (
                <TableRow key={c.requestId}>
                  <TableTd>
                    <p className="font-medium">{c.employeeName}</p>
                    <p className="text-xs text-gray-400">{c.employeeId}</p>
                  </TableTd>
                  <TableTd>{formatDate(c.requestDate)}</TableTd>
                  <TableTd>
                    <div className="text-xs space-y-0.5">
                      {c.requestedCheckIn  && <p className="text-green-700">Vào: {formatDateTime(c.requestedCheckIn)}</p>}
                      {c.requestedCheckOut && <p className="text-indigo-700">Ra: {formatDateTime(c.requestedCheckOut)}</p>}
                      {!c.requestedCheckIn && !c.requestedCheckOut && <span className="text-gray-400">—</span>}
                    </div>
                  </TableTd>
                  <TableTd>
                    <p className="text-sm text-gray-700 max-w-xs">{c.reason}</p>
                    {c.reviewNote && <p className="text-xs text-gray-400 mt-0.5">Ghi chú: {c.reviewNote}</p>}
                  </TableTd>
                  <TableTd>
                    <Badge variant={
                      c.status === 'APPROVED' ? 'success'
                      : c.status === 'REJECTED' ? 'danger'
                      : 'warning'
                    }>
                      {c.status === 'APPROVED' ? 'Đã duyệt' : c.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                    </Badge>
                    {c.approvedByName && <p className="text-xs text-gray-400 mt-0.5">{c.approvedByName}</p>}
                  </TableTd>
                  {!isEmployee && c.status === 'PENDING' && (
                    <TableTd>
                      {reviewingId === c.requestId ? (
                        <div className="space-y-2 min-w-45">
                          <Input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="Ghi chú (tuỳ chọn)" className="h-7 text-xs" />
                          <div className="flex gap-1.5">
                            <button onClick={() => reviewMut.mutate({ id: c.requestId, status: 'APPROVED', note: reviewNote })}
                              className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700">
                              <Check size={10} /> Duyệt
                            </button>
                            <button onClick={() => reviewMut.mutate({ id: c.requestId, status: 'REJECTED', note: reviewNote })}
                              className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                              <X size={10} /> Từ chối
                            </button>
                            <button onClick={() => { setReviewingId(null); setReviewNote(''); }}
                              className="text-xs text-gray-400 hover:text-gray-600">Huỷ</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReviewingId(c.requestId); setReviewNote(''); }}
                          className="text-xs text-indigo-600 hover:underline">Xem xét</button>
                      )}
                    </TableTd>
                  )}
                  {!isEmployee && c.status !== 'PENDING' && <TableTd />}
                </TableRow>
              ))}
              {corrections.length === 0 && (
                <TableRow>
                  <TableTd colSpan={6}>
                    <p className="text-center text-sm text-gray-400 py-6">Chưa có đơn sửa công nào.</p>
                  </TableTd>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )
      )}

      {/* Shifts tab */}
      {tab === 'shifts' && (
        loadingShifts ? <PageSpinner /> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Nhân viên</TableTh>
                <TableTh>Chức danh</TableTh>
                <TableTh>Ca hiện tại</TableTh>
                <TableTh>Đổi ca</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {shiftEmployees.filter((e) => e.status === 'ACTIVE').map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableTd>
                    <p className="font-medium">{emp.fullName}</p>
                    <p className="text-xs text-gray-400">{emp.employeeId}</p>
                  </TableTd>
                  <TableTd>{emp.position}</TableTd>
                  <TableTd>
                    {emp.defaultShift ? (
                      <Badge variant="default">
                        {emp.defaultShift === 'HANH_CHINH' ? 'Hành chính' : emp.defaultShift === 'CA_SANG' ? 'Ca sáng' : 'Ca tối'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">Chưa thiết lập</span>
                    )}
                  </TableTd>
                  <TableTd>
                    <select
                      defaultValue={emp.defaultShift ?? ''}
                      onChange={(e) => shiftMut.mutate({ id: emp.employeeId, shift: e.target.value })}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="">-- Chọn ca --</option>
                      <option value="HANH_CHINH">Hành chính (9:00–18:00)</option>
                      <option value="CA_SANG">Ca sáng (7:00–15:00)</option>
                      <option value="CA_TOI">Ca tối (15:00–23:00)</option>
                    </select>
                  </TableTd>
                </TableRow>
              ))}
              {shiftEmployees.filter((e) => e.status === 'ACTIVE').length === 0 && (
                <TableRow>
                  <TableTd colSpan={4}>
                    <p className="text-center text-sm text-gray-400 py-6">Không có nhân viên.</p>
                  </TableTd>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )
      )}

      {/* Correction request form modal */}
      <Modal open={openCorrForm} onClose={() => setOpenCorrForm(false)}
        title={corrRecord ? 'Yêu cầu sửa công' : 'Gửi đơn sửa công'} size="sm">
        <div className="space-y-4">
          {corrRecord && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm space-y-1">
              <p className="text-gray-500">Bản ghi: <span className="font-medium text-gray-800">{formatDate(corrRecord.dateWork)}</span></p>
              <p className="text-gray-500">Giờ vào: <span className="font-medium">{corrRecord.checkInTime ? formatDateTime(corrRecord.checkInTime) : '—'}</span></p>
              <p className="text-gray-500">Giờ ra: <span className="font-medium">{corrRecord.checkOutTime ? formatDateTime(corrRecord.checkOutTime) : '—'}</span></p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Giờ vào xin sửa</label>
              <input type="datetime-local" value={corrCheckIn}
                onChange={(e) => setCorrCheckIn(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Giờ ra xin sửa</label>
              <input type="datetime-local" value={corrCheckOut}
                onChange={(e) => setCorrCheckOut(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              Lý do <span className="text-red-500">*</span>
            </label>
            <textarea value={corrReason} onChange={(e) => setCorrReason(e.target.value)}
              rows={3} placeholder="Nhập lý do yêu cầu sửa công..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpenCorrForm(false)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
              Huỷ
            </button>
            <Button size="sm" onClick={submitCorrection} loading={corrMut.isPending}
              disabled={!corrReason.trim()}>
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
