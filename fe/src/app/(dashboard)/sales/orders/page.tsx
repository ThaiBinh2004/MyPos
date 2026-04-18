"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "@/services/sales.service";
import type { Order } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Truck, CheckCircle, XCircle, Package } from "lucide-react";

type BackendStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'SETTLED';

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'error' }> = {
  PENDING:   { label: 'Chờ xác nhận',  variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận',   variant: 'info' },
  SHIPPING:  { label: 'Đang giao',     variant: 'default' },
  COMPLETED: { label: 'Hoàn thành',    variant: 'success' },
  CANCELLED: { label: 'Đã hủy',        variant: 'error' },
  SETTLED:   { label: 'Đã quyết toán', variant: 'success' },
};

const NEXT_STATUS: Record<string, { status: string; label: string; icon: React.ReactNode }> = {
  PENDING:   { status: 'CONFIRMED', label: 'Xác nhận đơn',   icon: <CheckCircle size={13} /> },
  CONFIRMED: { status: 'SHIPPING',  label: 'Giao hàng',      icon: <Truck size={13} /> },
  SHIPPING:  { status: 'COMPLETED', label: 'Hoàn thành',     icon: <Package size={13} /> },
};

const TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Tại quầy' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label })),
];

export default function OrdersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', typeFilter, statusFilter],
    queryFn: () => getOrders({ orderType: typeFilter as Order['orderType'] || undefined, status: statusFilter as Order['status'] || undefined }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => updateOrderStatus(id, 'CANCELLED'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); setCancelTarget(null); },
  });

  const orders = data?.data ?? [];
  const onlineOrders = orders.filter(o => o.orderType?.toUpperCase() === 'ONLINE');
  const offlineOrders = orders.filter(o => o.orderType?.toUpperCase() === 'OFFLINE');
  const showAll = !typeFilter;

  const renderTable = (list: Order[], label?: string) => (
    <div className="mb-6">
      {label && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">{label}</h3>}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Mã đơn</TableTh>
                <TableTh>Khách hàng</TableTh>
                <TableTh>Loại</TableTh>
                <TableTh>Tổng tiền</TableTh>
                <TableTh>Phí ship</TableTh>
                <TableTh>Trạng thái</TableTh>
                <TableTh>Ngày tạo</TableTh>
                <TableTh>Thao tác</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableTd colSpan={8} className="text-center py-8 text-gray-400">Không có đơn hàng</TableTd>
                </TableRow>
              ) : list.map(order => {
                const statusKey = order.status?.toUpperCase();
                const cfg = STATUS_CONFIG[statusKey] ?? { label: statusKey, variant: 'default' as const };
                const nextStep = NEXT_STATUS[statusKey];
                const isExpanded = expanded === order.orderId;

                return (
                  <>
                    <TableRow key={order.orderId} className="cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(isExpanded ? null : order.orderId)}>
                      <TableTd>
                        <div className="flex items-center gap-1">
                          {isExpanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                          <span className="font-mono text-sm">{order.orderId}</span>
                        </div>
                      </TableTd>
                      <TableTd>
                        <p className="text-sm">{order.customerName}</p>
                        {order.customerPhone && <p className="text-xs text-gray-400">{order.customerPhone}</p>}
                      </TableTd>
                      <TableTd>
                        <Badge variant={order.orderType?.toUpperCase() === 'ONLINE' ? 'info' : 'default'}>
                          {order.orderType?.toUpperCase() === 'ONLINE' ? 'Online' : 'Tại quầy'}
                        </Badge>
                      </TableTd>
                      <TableTd className="font-semibold">{formatCurrency(order.totalAmount)}</TableTd>
                      <TableTd className="text-gray-500 text-sm">
                        {order.shippingFee > 0 ? formatCurrency(order.shippingFee) : '—'}
                      </TableTd>
                      <TableTd><Badge variant={cfg.variant}>{cfg.label}</Badge></TableTd>
                      <TableTd className="text-sm text-gray-500">{formatDate(order.createdAt)}</TableTd>
                      <TableTd onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          {nextStep && (
                            <Button size="sm"
                              onClick={() => updateMut.mutate({ id: order.orderId, status: nextStep.status })}
                              loading={updateMut.isPending}
                            >
                              {nextStep.icon} {nextStep.label}
                            </Button>
                          )}
                          {statusKey === 'PENDING' && (
                            <Button size="sm" variant="danger" onClick={() => setCancelTarget(order)}>
                              <XCircle size={13} /> Hủy
                            </Button>
                          )}
                        </div>
                      </TableTd>
                    </TableRow>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <TableRow key={`${order.orderId}-detail`}>
                        <TableTd colSpan={8} className="bg-gray-50 p-0">
                          <div className="px-6 py-3 space-y-2">
                            {order.shippingAddress && (
                              <p className="text-xs text-gray-500 flex items-center gap-1"><Truck size={11} /> Địa chỉ giao: {order.shippingAddress}</p>
                            )}
                            {order.note && <p className="text-xs text-gray-500">Ghi chú: {order.note}</p>}
                            {order.details && order.details.length > 0 ? (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-gray-400 border-b">
                                    <th className="text-left py-1 font-medium">Sản phẩm</th>
                                    <th className="text-right py-1 font-medium">SL</th>
                                    <th className="text-right py-1 font-medium">Đơn giá</th>
                                    <th className="text-right py-1 font-medium">Thành tiền</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.details.map(d => (
                                    <tr key={d.detailId} className="border-b border-gray-100">
                                      <td className="py-1">{d.productName} <span className="text-gray-400">({d.productId})</span></td>
                                      <td className="text-right">{d.quantity}</td>
                                      <td className="text-right">{formatCurrency(d.unitPrice)}</td>
                                      <td className="text-right font-semibold">{formatCurrency(d.subtotal)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Không có chi tiết sản phẩm.</p>
                            )}
                            <div className="flex gap-4 text-xs text-gray-600 pt-1">
                              {order.discountAmount > 0 && <span>Giảm giá: <strong className="text-amber-600">- {formatCurrency(order.discountAmount)}</strong></span>}
                              {order.loyaltyPointsUsed > 0 && <span>Điểm dùng: <strong>{order.loyaltyPointsUsed}</strong></span>}
                              <span>Thanh toán: <strong>{order.paymentMethod?.toUpperCase()}</strong></span>
                            </div>
                          </div>
                        </TableTd>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select options={TYPE_OPTIONS} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
        <p className="text-sm text-gray-400 ml-auto">{orders.length} đơn hàng</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : showAll ? (
        <>
          {renderTable(onlineOrders, 'Đơn Online')}
          {renderTable(offlineOrders, 'Đơn tại quầy')}
        </>
      ) : (
        renderTable(orders)
      )}

      {/* Cancel confirm modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Xác nhận hủy đơn">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Hủy đơn <strong>{cancelTarget?.orderId}</strong> — {cancelTarget?.customerName}?</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Không</Button>
            <Button variant="danger" onClick={() => cancelTarget && cancelMut.mutate(cancelTarget.orderId)} loading={cancelMut.isPending}>Xác nhận hủy</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
