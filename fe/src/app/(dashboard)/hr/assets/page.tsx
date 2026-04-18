'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCheck, UserX } from 'lucide-react';
import { getAssets, createAsset, assignAsset } from '@/services/asset.service';
import { getEmployees } from '@/services/employee.service';
import {
  Button, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner, Input, Select, Pagination,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { isManager } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';
import type { Asset } from '@/types';

const conditionLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  TỐT:      { label: 'Tốt',       variant: 'success' },
  good:     { label: 'Tốt',       variant: 'success' },
  fair:     { label: 'Trung bình', variant: 'warning' },
  damaged:  { label: 'Hỏng',      variant: 'warning' },
  missing:  { label: 'Mất',       variant: 'danger' },
};

export default function AssetsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const manager = isManager(user?.role ?? '');

  const [page, setPage] = useState(1);

  // Add asset form
  const [openForm, setOpenForm] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignDate, setAssignDate] = useState('');

  // Assign existing asset
  const [assignAssetObj, setAssignAssetObj] = useState<Asset | null>(null);
  const [assignToEmpId, setAssignToEmpId] = useState('');
  const [assignToDate, setAssignToDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['assets', page],
    queryFn: () => getAssets({ page, pageSize: 20 }),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees-active'],
    queryFn: () => getEmployees({ status: 'ACTIVE', pageSize: 200 }),
    enabled: openForm || !!assignAssetObj,
  });

  const empOptions = [
    { value: '', label: 'Không bàn giao' },
    ...(employees?.data ?? []).map(e => ({ value: e.employeeId, label: `${e.fullName} (${e.employeeId})` })),
  ];

  const createMutation = useMutation({
    mutationFn: () => createAsset({
      assetName,
      assetValue: Number(assetValue),
      ...(assignEmpId && { employeeId: assignEmpId, handoverDate: assignDate || new Date().toISOString().slice(0, 10) }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      setOpenForm(false);
      setAssetName(''); setAssetValue(''); setAssignEmpId(''); setAssignDate('');
    },
  });

  const assignMutation = useMutation({
    mutationFn: () => assignAsset(assignAssetObj!.assetId, {
      employeeId: assignToEmpId || undefined,
      handoverDate: assignToDate || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      setAssignAssetObj(null); setAssignToEmpId(''); setAssignToDate('');
    },
  });

  return (
    <div className="space-y-4">
      {manager && (
        <div className="flex justify-end">
          <Button onClick={() => setOpenForm(true)}>
            <Plus size={16} /> Thêm tài sản
          </Button>
        </div>
      )}

      {isLoading ? <PageSpinner /> : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Tên tài sản</TableTh>
                <TableTh>Giá trị</TableTh>
                <TableTh>Người được giao</TableTh>
                <TableTh>Ngày bàn giao</TableTh>
                <TableTh>Tình trạng</TableTh>
                {manager && <TableTh />}
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data.map((a) => {
                const cond = conditionLabel[a.assetCondition?.toLowerCase()] ?? conditionLabel[a.assetCondition] ?? { label: a.assetCondition, variant: 'default' as const };
                return (
                  <TableRow key={a.assetId}>
                    <TableTd className="font-medium">{a.assetName}</TableTd>
                    <TableTd>{formatCurrency(a.assetValue)}</TableTd>
                    <TableTd>
                      {a.employeeName
                        ? <span className="flex items-center gap-1.5 text-sm"><UserCheck size={13} className="text-emerald-500" />{a.employeeName}</span>
                        : <span className="text-slate-400 text-sm">—</span>}
                    </TableTd>
                    <TableTd>{a.handoverDate ? formatDate(a.handoverDate) : '—'}</TableTd>
                    <TableTd>
                      <Badge variant={cond.variant as any}>{cond.label}</Badge>
                    </TableTd>
                    {manager && (
                      <TableTd>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAssignAssetObj(a);
                            setAssignToEmpId(a.employeeId ?? '');
                            setAssignToDate(a.handoverDate ?? '');
                          }}
                        >
                          {a.employeeId ? <><UserX size={13} /> Đổi</> : <><UserCheck size={13} /> Bàn giao</>}
                        </Button>
                      </TableTd>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {data && <Pagination page={page} total={data.total} pageSize={20} onChange={setPage} />}
        </>
      )}

      {/* Modal: Thêm tài sản */}
      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Thêm tài sản">
        <div className="space-y-4">
          <Input label="Tên tài sản" value={assetName} onChange={e => setAssetName(e.target.value)} />
          <Input label="Giá trị (₫)" type="number" value={assetValue} onChange={e => setAssetValue(e.target.value)} />
          <Select label="Bàn giao cho" options={empOptions} value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} />
          {assignEmpId && (
            <Input label="Ngày bàn giao" type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} />
          )}
          <div className="flex justify-end">
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!assetName || !assetValue}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Bàn giao / đổi người */}
      <Modal
        open={!!assignAssetObj}
        onClose={() => setAssignAssetObj(null)}
        title={`Bàn giao: ${assignAssetObj?.assetName}`}
      >
        <div className="space-y-4">
          <Select
            label="Người được giao"
            options={empOptions}
            value={assignToEmpId}
            onChange={e => setAssignToEmpId(e.target.value)}
          />
          {assignToEmpId && (
            <Input label="Ngày bàn giao" type="date" value={assignToDate} onChange={e => setAssignToDate(e.target.value)} />
          )}
          <div className="flex justify-end">
            <Button onClick={() => assignMutation.mutate()} loading={assignMutation.isPending}>
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
