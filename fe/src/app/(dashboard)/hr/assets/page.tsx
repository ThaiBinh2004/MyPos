'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getAssets, createAsset } from '@/services/asset.service';
import {
  Button, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Modal, PageSpinner, Input, Select,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { AssetCondition } from '@/types';

const conditionLabel: Record<AssetCondition, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  good: { label: 'Tốt', variant: 'success' },
  damaged: { label: 'Hỏng', variant: 'warning' },
  missing: { label: 'Mất', variant: 'danger' },
};

export default function AssetsPage() {
  const qc = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [assetValue, setAssetValue] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => getAssets({ page: 1, pageSize: 50 }),
  });

  const create = useMutation({
    mutationFn: () => createAsset({ assetName, assetType, assetValue: Number(assetValue) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] });
      setOpenForm(false);
      setAssetName(''); setAssetType(''); setAssetValue('');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Tài sản</h1>
        <Button onClick={() => setOpenForm(true)}>
          <Plus size={16} /> Thêm tài sản
        </Button>
      </div>

      {isLoading ? <PageSpinner /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Tên tài sản</TableTh>
              <TableTh>Loại</TableTh>
              <TableTh>Giá trị</TableTh>
              <TableTh>Nhân viên giữ</TableTh>
              <TableTh>Ngày bàn giao</TableTh>
              <TableTh>Tình trạng</TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((a) => {
              const condition = conditionLabel[a.assetCondition?.toLowerCase()] ?? { label: a.assetCondition, variant: 'default' as const };
              return (
                <TableRow key={a.assetId}>
                  <TableTd className="font-medium">{a.assetName}</TableTd>
                  <TableTd>{a.assetType}</TableTd>
                  <TableTd>{formatCurrency(a.assetValue)}</TableTd>
                  <TableTd>{a.employeeName ?? '—'}</TableTd>
                  <TableTd>{a.handoverDate ? formatDate(a.handoverDate) : '—'}</TableTd>
                  <TableTd><Badge variant={condition.variant}>{condition.label}</Badge></TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Thêm tài sản">
        <div className="space-y-4">
          <Input label="Tên tài sản" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
          <Input label="Loại tài sản" value={assetType} onChange={(e) => setAssetType(e.target.value)} />
          <Input label="Giá trị" type="number" value={assetValue} onChange={(e) => setAssetValue(e.target.value)} />
          <div className="flex justify-end">
            <Button onClick={() => create.mutate()} loading={create.isPending}>Lưu</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
