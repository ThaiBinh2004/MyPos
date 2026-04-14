'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendanceRecords, getCorrections, reviewCorrection } from '@/services/attendance.service';
import {
  Button, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, PageSpinner,
} from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { AttendanceFilters } from '@/types';

const statusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default' | 'info' }> = {
  on_time: { label: 'Đúng giờ', variant: 'success' },
  late: { label: 'Trễ', variant: 'warning' },
  early_leave: { label: 'Về sớm', variant: 'warning' },
  absent: { label: 'Vắng', variant: 'danger' },
  missing_checkout: { label: 'Quên checkout', variant: 'info' },
};

export default function AttendancePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'records' | 'corrections'>('records');
  const [filters, setFilters] = useState<AttendanceFilters>({ page: 1, pageSize: 20 });

  const { data: records, isLoading: loadingRecords } = useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => getAttendanceRecords(filters),
    enabled: tab === 'records',
  });

  const { data: corrections, isLoading: loadingCorrections } = useQuery({
    queryKey: ['corrections'],
    queryFn: () => getCorrections({ page: 1, pageSize: 20 }),
    enabled: tab === 'corrections',
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'approved' | 'rejected' }) =>
      reviewCorrection(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['corrections'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Chấm công</h1>

      <div className="flex gap-2 border-b border-gray-200">
        {(['records', 'corrections'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'records' ? 'Bảng chấm công' : 'Yêu cầu điều chỉnh'}
          </button>
        ))}
      </div>

      {tab === 'records' && (
        <>
          <div className="flex gap-3">
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            />
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            />
            <Select
              options={Object.entries(statusLabel).map(([value, { label }]) => ({ value, label }))}
              placeholder="Tất cả trạng thái"
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as never || undefined }))}
              className="w-44"
            />
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
                  <TableTh>Ghi chú</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {records?.data.map((r) => {
                  const status = statusLabel[r.status?.toLowerCase()] ?? { label: r.status, variant: 'default' as const };
                  return (
                    <TableRow key={r.attendanceId}>
                      <TableTd>
                        <p className="font-medium">{r.employeeName}</p>
                        <p className="text-xs text-gray-500">{r.employeeId}</p>
                      </TableTd>
                      <TableTd>{formatDate(r.dateWork)}</TableTd>
                      <TableTd>{r.checkInTime ? formatDateTime(r.checkInTime) : '—'}</TableTd>
                      <TableTd>{r.checkOutTime ? formatDateTime(r.checkOutTime) : '—'}</TableTd>
                      <TableTd>{r.totalHours ?? '—'}</TableTd>
                      <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                      <TableTd>{r.note ?? '—'}</TableTd>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </>
      )}

      {tab === 'corrections' && (
        <>
          {loadingCorrections ? <PageSpinner /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Nhân viên</TableTh>
                  <TableTh>Ngày yêu cầu</TableTh>
                  <TableTh>Trạng thái</TableTh>
                  <TableTh />
                </TableRow>
              </TableHead>
              <TableBody>
                {corrections?.data.map((c) => (
                  <TableRow key={c.requestId}>
                    <TableTd>
                      <p className="font-medium">{c.employeeName}</p>
                      <p className="text-xs text-gray-500">{c.employeeId}</p>
                    </TableTd>
                    <TableTd>{formatDate(c.requestDate)}</TableTd>
                    <TableTd>
                      <Badge
                        variant={
                          c.status === 'approved' ? 'success'
                          : c.status === 'rejected' ? 'danger'
                          : 'warning'
                        }
                      >
                        {c.status === 'approved' ? 'Đã duyệt' : c.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </Badge>
                    </TableTd>
                    <TableTd>
                      {c.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => review.mutate({ id: c.requestId, status: 'approved' })}>
                            Duyệt
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => review.mutate({ id: c.requestId, status: 'rejected' })}>
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
