'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getContracts, approveContract, terminateContract } from '@/services/contract.service';
import {
  Button, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { ContractFilters } from '@/types';
import { ContractForm } from './contract-form';

const statusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default' }> = {
  active: { label: 'Hiệu lực', variant: 'success' },
  pending: { label: 'Chờ duyệt', variant: 'warning' },
  expired: { label: 'Hết hạn', variant: 'default' },
  terminated: { label: 'Đã chấm dứt', variant: 'danger' },
};

export default function ContractsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<ContractFilters>({ page: 1, pageSize: 20 });
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', filters],
    queryFn: () => getContracts(filters),
  });

  const approve = useMutation({
    mutationFn: (id: string) => approveContract(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const terminate = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => terminateContract(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Hợp đồng</h1>
        <Button onClick={() => setOpenForm(true)}>
          <Plus size={16} /> Tạo hợp đồng
        </Button>
      </div>

      <div className="flex gap-3">
        <Select
          options={[
            { value: 'active', label: 'Hiệu lực' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'expired', label: 'Hết hạn' },
            { value: 'terminated', label: 'Đã chấm dứt' },
          ]}
          placeholder="Tất cả trạng thái"
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as never || undefined, page: 1 }))}
          className="w-44"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nhân viên</TableTh>
              <TableTh>Loại hợp đồng</TableTh>
              <TableTh>Ngày bắt đầu</TableTh>
              <TableTh>Ngày kết thúc</TableTh>
              <TableTh>Lương cơ bản</TableTh>
              <TableTh>Trạng thái</TableTh>
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((c) => {
              const status = statusLabel[c.status];
              return (
                <TableRow key={c.contractId}>
                  <TableTd>
                    <p className="font-medium text-gray-900">{c.employeeName}</p>
                    <p className="text-xs text-gray-500">{c.employeeId}</p>
                  </TableTd>
                  <TableTd>{c.contractType}</TableTd>
                  <TableTd>{formatDate(c.startDate)}</TableTd>
                  <TableTd>{c.endDate ? formatDate(c.endDate) : '—'}</TableTd>
                  <TableTd>{formatCurrency(c.baseSalary)}</TableTd>
                  <TableTd><Badge variant={status.variant}>{status.label}</Badge></TableTd>
                  <TableTd>
                    <div className="flex gap-2">
                      {c.status === 'pending' && (
                        <Button size="sm" onClick={() => approve.mutate(c.contractId)}>
                          Duyệt
                        </Button>
                      )}
                      {c.status === 'active' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => terminate.mutate({ id: c.contractId, reason: 'Chấm dứt hợp đồng' })}
                        >
                          Chấm dứt
                        </Button>
                      )}
                    </div>
                  </TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Tạo hợp đồng" size="md">
        <ContractForm
          onSuccess={() => {
            setOpenForm(false);
            qc.invalidateQueries({ queryKey: ['contracts'] });
          }}
        />
      </Modal>
    </div>
  );
}
