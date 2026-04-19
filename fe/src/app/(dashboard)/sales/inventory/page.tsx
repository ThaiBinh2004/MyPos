"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInventory, getStockTransfers, createStockTransfer, completeStockTransfer, cancelStockTransfer,
  getStockAudits, createStockAudit, resolveStockAudit, getProducts,
} from "@/services/sales.service";
import type { InventoryFilters, StockTransfer, StockAudit } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { MANAGER_ROLES } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { ArrowRightLeft, ClipboardCheck, Warehouse, Plus, CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const BRANCH_OPTIONS = [
  { value: "", label: "Tất cả chi nhánh" },
  { value: "BR001", label: "Chi nhánh Quận 1" },
  { value: "BR002", label: "Chi nhánh Quận 3" },
  { value: "BR003", label: "Chi nhánh Bình Thạnh" },
];
const BRANCH_SELECT = BRANCH_OPTIONS.slice(1);

export default function InventoryPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [tab, setTab] = useState<'stock' | 'transfer' | 'audit'>('stock');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [filters, setFilters] = useState<InventoryFilters>({ page: 1, pageSize: 50 });
  const [branchFilter, setBranchFilter] = useState('');

  // Transfer form
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [tfFrom, setTfFrom] = useState('');
  const [tfTo, setTfTo] = useState('');
  const [tfProduct, setTfProduct] = useState('');
  const [tfQty, setTfQty] = useState('');
  const [tfNote, setTfNote] = useState('');

  // Audit form
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [audBranch, setAudBranch] = useState('');
  const [audProduct, setAudProduct] = useState('');
  const [audActual, setAudActual] = useState('');
  const [audNote, setAudNote] = useState('');

  const defaultBranch = user?.branchId ?? 'BR001';

  // Resolve audit modal
  const [resolveTarget, setResolveTarget] = useState<StockAudit | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  const { data: invData, isLoading: invLoading } = useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => getInventory(filters),
  });
  const { data: lowStockData } = useQuery({
    queryKey: ['inventory-low'],
    queryFn: () => getInventory({ lowStock: true, pageSize: 100 }),
    staleTime: 60_000,
  });
  const { data: transfers = [], isLoading: tfLoading } = useQuery({
    queryKey: ['transfers', branchFilter],
    queryFn: () => getStockTransfers(branchFilter || undefined),
    enabled: tab === 'transfer',
  });
  const { data: audits = [], isLoading: auditLoading } = useQuery({
    queryKey: ['audits', branchFilter],
    queryFn: () => getStockAudits(branchFilter || undefined),
    enabled: tab === 'audit',
  });
  const { data: productsData } = useQuery({
    queryKey: ['products', { pageSize: 200 }],
    queryFn: () => getProducts({ pageSize: 200 }),
  });

  const products = productsData?.data ?? [];
  const productOptions = products.map(p => ({ value: p.productId, label: `${p.productName} (${p.sku})` }));
  const items = invData?.data ?? [];
  const total = invData?.total ?? 0;
  const lowStockItems = lowStockData?.data ?? [];
  const outOfStock = lowStockItems.filter(i => i.quantity === 0);
  const lowStock = lowStockItems.filter(i => i.quantity > 0);

  const createTransferMut = useMutation({
    mutationFn: createStockTransfer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transfers'] }); setShowTransferForm(false); setTfFrom(''); setTfTo(''); setTfProduct(''); setTfQty(''); setTfNote(''); },
  });
  const completeMut = useMutation({
    mutationFn: completeStockTransfer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transfers'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); },
  });
  const cancelTfMut = useMutation({
    mutationFn: cancelStockTransfer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transfers'] }),
  });
  const createAuditMut = useMutation({
    mutationFn: createStockAudit,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['audits'] }); setShowAuditForm(false); setAudBranch(''); setAudProduct(''); setAudActual(''); setAudNote(''); },
  });
  const resolveMut = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => resolveStockAudit(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['audits'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); setResolveTarget(null); setResolveNote(''); },
  });

  const tabs = [
    { key: 'stock', label: 'Tồn kho', icon: <Warehouse size={14} /> },
    { key: 'transfer', label: 'Chuyển kho', icon: <ArrowRightLeft size={14} /> },
    { key: 'audit', label: 'Kiểm kho', icon: <ClipboardCheck size={14} /> },
  ] as const;

  const tfStatusCfg: Record<string, { label: string; variant: 'warning' | 'success' | 'error' }> = {
    PENDING: { label: 'Chờ xử lý', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'error' },
  };
  const audStatusCfg: Record<string, { label: string; variant: 'warning' | 'success' }> = {
    PENDING: { label: 'Chờ xử lý', variant: 'warning' },
    RESOLVED: { label: 'Đã xử lý', variant: 'success' },
  };

  return (
    <div className="p-6 space-y-4">
      {/* Low stock alert banner */}
      {!alertDismissed && lowStockItems.length > 0 && (
        <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${outOfStock.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${outOfStock.length > 0 ? 'text-red-500' : 'text-amber-500'}`} />
          <div className="flex-1 text-sm">
            <p className={`font-semibold ${outOfStock.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
              Cảnh báo tồn kho
            </p>
            {outOfStock.length > 0 && (() => {
              const grouped = outOfStock.reduce<Record<string, string[]>>((acc, i) => {
                if (!acc[i.productName]) acc[i.productName] = [];
                acc[i.productName].push(i.branchName ?? i.branchId);
                return acc;
              }, {});
              const entries = Object.entries(grouped);
              return (
                <p className="text-red-600 text-xs mt-0.5">
                  <strong>Hết hàng ({entries.length} sản phẩm):</strong>{' '}
                  {entries.slice(0, 4).map(([name, branches]) => `${name} (${branches.join(', ')})`).join(' · ')}
                  {entries.length > 4 ? ` và ${entries.length - 4} sản phẩm khác` : ''}
                </p>
              );
            })()}
            {lowStock.length > 0 && (() => {
              const grouped = lowStock.reduce<Record<string, string[]>>((acc, i) => {
                if (!acc[i.productName]) acc[i.productName] = [];
                acc[i.productName].push(i.branchName ?? i.branchId);
                return acc;
              }, {});
              const entries = Object.entries(grouped);
              return (
                <p className="text-amber-600 text-xs mt-0.5">
                  <strong>Sắp hết ({entries.length} sản phẩm):</strong>{' '}
                  {entries.slice(0, 4).map(([name, branches]) => `${name} (${branches.join(', ')})`).join(' · ')}
                  {entries.length > 4 ? ` và ${entries.length - 4} sản phẩm khác` : ''}
                </p>
              );
            })()}
          </div>
          <button onClick={() => setAlertDismissed(true)} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          {tab !== 'stock' && (
            <Select options={BRANCH_OPTIONS} value={branchFilter} onChange={e => setBranchFilter(e.target.value)} />
          )}
          {tab === 'transfer' && (
            <Button onClick={() => { setTfFrom(defaultBranch); setTfTo(''); setTfProduct(''); setTfQty(''); setTfNote(''); setShowTransferForm(true); }}>
              <Plus size={14} /> Tạo phiếu chuyển
            </Button>
          )}
          {tab === 'audit' && (
            <Button onClick={() => { setAudBranch(defaultBranch); setAudProduct(''); setAudActual(''); setAudNote(''); setShowAuditForm(true); }}>
              <Plus size={14} /> Tạo phiếu kiểm
            </Button>
          )}
        </div>
      </div>

      {/* === TỒN KHO === */}
      {tab === 'stock' && (
        <>
          <div className="flex gap-3">
            <Select options={BRANCH_OPTIONS} value={filters.branchId ?? ''}
              onChange={e => setFilters(f => ({ ...f, branchId: e.target.value || undefined, page: 1 }))} />
            <Button variant={filters.lowStock ? 'primary' : 'ghost'}
              onClick={() => setFilters(f => ({ ...f, lowStock: !f.lowStock, page: 1 }))}>
              <AlertTriangle size={13} /> Sắp hết hàng
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh>Sản phẩm</TableTh><TableTh>Chi nhánh</TableTh>
                    <TableTh>Tồn kho</TableTh><TableTh>Ngưỡng tối thiểu</TableTh>
                    <TableTh>Tình trạng</TableTh><TableTh>Cập nhật</TableTh>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invLoading ? (
                    <TableRow><TableTd colSpan={6} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                  ) : items.length === 0 ? (
                    <TableRow><TableTd colSpan={6} className="text-center py-8 text-gray-400">Không có dữ liệu</TableTd></TableRow>
                  ) : items.map(item => {
                    const isOut = item.quantity === 0;
                    const isLow = !isOut && item.quantity <= item.minThreshold;
                    return (
                      <TableRow key={item.inventoryId}>
                        <TableTd className="font-medium">{item.productName}</TableTd>
                        <TableTd>{item.branchName ?? item.branchId}</TableTd>
                        <TableTd>
                          <span className={`font-bold text-sm ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-800'}`}>{item.quantity}</span>
                        </TableTd>
                        <TableTd className="text-gray-500">{item.minThreshold}</TableTd>
                        <TableTd>
                          <Badge variant={isOut ? 'error' : isLow ? 'warning' : 'success'}>
                            {isOut ? 'Hết hàng' : isLow ? 'Sắp hết' : 'Còn hàng'}
                          </Badge>
                        </TableTd>
                        <TableTd className="text-sm text-gray-400">{formatDate(item.updatedAt)}</TableTd>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* === CHUYỂN KHO === */}
      {tab === 'transfer' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Mã phiếu</TableTh><TableTh>Sản phẩm</TableTh><TableTh>SL</TableTh>
                  <TableTh>Từ chi nhánh</TableTh><TableTh>Đến chi nhánh</TableTh>
                  <TableTh>Trạng thái</TableTh><TableTh>Ngày tạo</TableTh>
                  <TableTh>Thao tác</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {tfLoading ? (
                  <TableRow><TableTd colSpan={8} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                ) : transfers.length === 0 ? (
                  <TableRow><TableTd colSpan={8} className="text-center py-8 text-gray-400">Chưa có phiếu chuyển kho</TableTd></TableRow>
                ) : transfers.map((t: StockTransfer) => {
                  const cfg = tfStatusCfg[t.status] ?? { label: t.status, variant: 'default' as const };
                  return (
                    <TableRow key={t.transferId}>
                      <TableTd className="font-mono text-sm">{t.transferId}</TableTd>
                      <TableTd className="font-medium">{t.productName}</TableTd>
                      <TableTd className="font-bold">{t.quantity}</TableTd>
                      <TableTd>{t.fromBranchName}</TableTd>
                      <TableTd>{t.toBranchName}</TableTd>
                      <TableTd><Badge variant={cfg.variant}>{cfg.label}</Badge></TableTd>
                      <TableTd className="text-sm text-gray-400">{formatDate(t.createdAt)}</TableTd>
                      <TableTd>
                        {t.status === 'PENDING' && MANAGER_ROLES.includes(user?.role ?? '') && (
                          <div className="flex gap-1.5">
                            <Button size="sm" onClick={() => completeMut.mutate(t.transferId)} loading={completeMut.isPending}>
                              <CheckCircle size={12} /> Hoàn thành
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => cancelTfMut.mutate(t.transferId)} loading={cancelTfMut.isPending}>
                              <XCircle size={12} /> Hủy
                            </Button>
                          </div>
                        )}
                      </TableTd>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* === KIỂM KHO === */}
      {tab === 'audit' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Mã phiếu</TableTh><TableTh>Sản phẩm</TableTh><TableTh>Chi nhánh</TableTh>
                  <TableTh>Hệ thống</TableTh><TableTh>Thực tế</TableTh><TableTh>Chênh lệch</TableTh>
                  <TableTh>Trạng thái</TableTh><TableTh>Ngày kiểm</TableTh><TableTh>Thao tác</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLoading ? (
                  <TableRow><TableTd colSpan={9} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                ) : audits.length === 0 ? (
                  <TableRow><TableTd colSpan={9} className="text-center py-8 text-gray-400">Chưa có phiếu kiểm kho</TableTd></TableRow>
                ) : audits.map((a: StockAudit) => {
                  const cfg = audStatusCfg[a.status] ?? { label: a.status, variant: 'default' as const };
                  return (
                    <TableRow key={a.auditId}>
                      <TableTd className="font-mono text-sm">{a.auditId}</TableTd>
                      <TableTd className="font-medium">{a.productName}</TableTd>
                      <TableTd>{a.branchName}</TableTd>
                      <TableTd>{a.systemQuantity}</TableTd>
                      <TableTd>{a.actualQuantity}</TableTd>
                      <TableTd>
                        <span className={`font-bold text-sm ${a.difference > 0 ? 'text-green-600' : a.difference < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {a.difference > 0 ? `+${a.difference}` : a.difference}
                        </span>
                      </TableTd>
                      <TableTd><Badge variant={cfg.variant}>{cfg.label}</Badge></TableTd>
                      <TableTd className="text-sm text-gray-400">{formatDate(a.createdAt)}</TableTd>
                      <TableTd>
                        {a.status === 'PENDING' && a.difference !== 0 && MANAGER_ROLES.includes(user?.role ?? '') && (
                          <Button size="sm" onClick={() => { setResolveTarget(a); setResolveNote(''); }}>
                            Xử lý chênh lệch
                          </Button>
                        )}
                      </TableTd>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal: Tạo phiếu chuyển kho */}
      <Modal open={showTransferForm} onClose={() => setShowTransferForm(false)} title="Tạo phiếu chuyển kho nội bộ">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Từ chi nhánh *</label>
              <Select options={BRANCH_SELECT} value={tfFrom} onChange={e => setTfFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Đến chi nhánh *</label>
              <Select options={BRANCH_SELECT} value={tfTo} onChange={e => setTfTo(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Sản phẩm *</label>
            <Select options={[{ value: '', label: 'Chọn sản phẩm...' }, ...productOptions]} value={tfProduct} onChange={e => setTfProduct(e.target.value)} />
          </div>
          <Input label="Số lượng *" type="number" value={tfQty} onChange={e => setTfQty(e.target.value)} />
          <Input label="Ghi chú" value={tfNote} onChange={e => setTfNote(e.target.value)} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowTransferForm(false)}>Hủy</Button>
            <Button
              onClick={() => createTransferMut.mutate({ fromBranchId: tfFrom, toBranchId: tfTo, productId: tfProduct, quantity: parseInt(tfQty), note: tfNote, createdByEmployeeId: user?.employeeId ?? undefined })}
              loading={createTransferMut.isPending}
              disabled={!tfFrom || !tfTo || !tfProduct || !tfQty || tfFrom === tfTo}
            >Tạo phiếu</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Tạo phiếu kiểm kho */}
      <Modal open={showAuditForm} onClose={() => setShowAuditForm(false)} title="Tạo phiếu kiểm kho">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Chi nhánh *</label>
            <Select options={BRANCH_SELECT} value={audBranch} onChange={e => setAudBranch(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Sản phẩm *</label>
            <Select options={[{ value: '', label: 'Chọn sản phẩm...' }, ...productOptions]} value={audProduct} onChange={e => setAudProduct(e.target.value)} />
          </div>
          <Input label="Số lượng thực tế *" type="number" value={audActual} onChange={e => setAudActual(e.target.value)} />
          <Input label="Ghi chú" value={audNote} onChange={e => setAudNote(e.target.value)} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowAuditForm(false)}>Hủy</Button>
            <Button
              onClick={() => createAuditMut.mutate({ branchId: audBranch, productId: audProduct, actualQuantity: parseInt(audActual), note: audNote, auditedByEmployeeId: user?.employeeId ?? undefined })}
              loading={createAuditMut.isPending}
              disabled={!audBranch || !audProduct || !audActual}
            >Tạo phiếu</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Xử lý chênh lệch */}
      <Modal open={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Xử lý chênh lệch tồn kho">
        {resolveTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-sm space-y-1">
              <p className="font-medium text-gray-800">{resolveTarget.productName} — {resolveTarget.branchName}</p>
              <div className="flex gap-4 text-xs">
                <span>Hệ thống: <strong>{resolveTarget.systemQuantity}</strong></span>
                <span>Thực tế: <strong>{resolveTarget.actualQuantity}</strong></span>
                <span className={`font-bold ${resolveTarget.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Chênh lệch: {resolveTarget.difference > 0 ? `+${resolveTarget.difference}` : resolveTarget.difference}
                </span>
              </div>
              <p className="text-xs text-orange-600">Hệ thống sẽ điều chỉnh tồn kho về số lượng thực tế ({resolveTarget.actualQuantity}).</p>
            </div>
            <Input label="Ghi chú xử lý" value={resolveNote} onChange={e => setResolveNote(e.target.value)} placeholder="Lý do chênh lệch, cách xử lý..." />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResolveTarget(null)}>Hủy</Button>
              <Button onClick={() => resolveMut.mutate({ id: resolveTarget.auditId, note: resolveNote })} loading={resolveMut.isPending}>
                Xác nhận điều chỉnh
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
