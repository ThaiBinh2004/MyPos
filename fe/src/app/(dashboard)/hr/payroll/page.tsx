'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { getPayrolls, confirmPayroll, markAsPaid, exportPayroll, getPaySlip } from '@/services/payroll.service';
import {
  Button, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, PageSpinner, Pagination,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { isManager } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';
import type { PayrollStatus } from '@/types';

const statusLabel: Record<PayrollStatus, { label: string; variant: 'default' | 'warning' | 'success' }> = {
  draft: { label: 'Nháp', variant: 'default' },
  confirmed: { label: 'Đã xác nhận', variant: 'warning' },
  paid: { label: 'Đã trả', variant: 'success' },
};

const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Tháng ${i + 1}`,
}));

const years = [2024, 2025, 2026].map((y) => ({ value: String(y), label: String(y) }));

export default function PayrollPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const manager = isManager(user?.role ?? '');
  const now = new Date();
  const [monthNum, setMonthNum] = useState(now.getMonth() + 1);
  const [yearNum, setYearNum] = useState(now.getFullYear());
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', monthNum, yearNum, page],
    queryFn: () => getPayrolls({ monthNum, yearNum, page, pageSize: 20 }),
  });

  const confirm = useMutation({
    mutationFn: () => confirmPayroll(monthNum, yearNum),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });

  const paid = useMutation({
    mutationFn: () => markAsPaid(monthNum, yearNum),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });

  async function handleExport() {
    const blob = await exportPayroll(monthNum, yearNum);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luong_${monthNum}_${yearNum}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} /> Xuất Excel
        </Button>
        {manager && (
          <>
            <Button variant="secondary" onClick={() => confirm.mutate()} loading={confirm.isPending}>
              Xác nhận
            </Button>
            <Button onClick={() => paid.mutate()} loading={paid.isPending}>
              Đánh dấu đã trả
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Select
          options={months}
          value={monthNum}
          onChange={(e) => setMonthNum(Number(e.target.value))}
          className="w-36"
        />
        <Select
          options={years}
          value={yearNum}
          onChange={(e) => setYearNum(Number(e.target.value))}
          className="w-28"
        />
      </div>

      {isLoading ? <PageSpinner /> : (
        <>
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nhân viên</TableTh>
              <TableTh>Chi nhánh</TableTh>
              <TableTh>Lương cơ bản</TableTh>
              <TableTh>Phụ cấp</TableTh>
              <TableTh>Doanh số</TableTh>
              <TableTh>Thưởng</TableTh>
              <TableTh>Khấu trừ</TableTh>
              <TableTh>Thực lĩnh</TableTh>
              <TableTh>Trạng thái</TableTh>
              <TableTh>Phiếu lương</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((p) => {
              const status = statusLabel[p.status?.toLowerCase()] ?? { label: p.status, variant: 'default' as const };
              return (
                <TableRow key={p.payrollId}>
                  <TableTd>
                    <p className="font-medium">{p.employeeName}</p>
                    <p className="text-xs text-gray-500">{p.employeeId}</p>
                  </TableTd>
                  <TableTd>{p.branchId}</TableTd>
                  <TableTd>{formatCurrency(p.baseSalary)}</TableTd>
                  <TableTd>{formatCurrency(p.allowance)}</TableTd>
                  <TableTd>{formatCurrency(p.salesPay)}</TableTd>
                  <TableTd>{formatCurrency(p.salesBonus + p.absBonus)}</TableTd>
                  <TableTd>{formatCurrency(p.deduction)}</TableTd>
                  <TableTd className="font-semibold">{formatCurrency(p.netSalary)}</TableTd>
                  <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                  <TableTd>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const slip = await getPaySlip(p.payrollId);
                        console.log('Payslip:', slip);
                      }}
                    >
                      Xem
                    </Button>
                  </TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {data && <Pagination page={page} total={data.total} pageSize={20} onChange={(p) => { setPage(p); }} />}
        </>
      )}
    </div>
  );
}
