"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders, updateOrderStatus, createOrder,
  getProducts, getCustomers, createCustomer,
} from "@/services/sales.service";
import type { Order, Product, Customer } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, Truck, CheckCircle, XCircle,
  Package, Plus, Search, UserSearch, UserPlus, Trash2,
} from "lucide-react";

type BackendStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'error' }> = {
  PENDING:   { label: 'Chờ xác nhận', variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận',  variant: 'info' },
  SHIPPING:  { label: 'Đang giao',    variant: 'default' },
  COMPLETED: { label: 'Hoàn thành',   variant: 'success' },
  CANCELLED: { label: 'Đã hủy',       variant: 'error' },
};

const NEXT_STATUS: Record<string, { status: string; label: string; icon: React.ReactNode }> = {
  PENDING:   { status: 'CONFIRMED', label: 'Xác nhận',  icon: <CheckCircle size={13} /> },
  CONFIRMED: { status: 'SHIPPING',  label: 'Giao hàng', icon: <Truck size={13} /> },
  SHIPPING:  { status: 'COMPLETED', label: 'Hoàn thành',icon: <Package size={13} /> },
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

interface OrderLine { product: Product; quantity: number; }

export default function OrdersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  // Create online order state
  const [showCreate, setShowCreate] = useState(false);
  const [coCustomer, setCoCustomer] = useState<Customer | null>(null);
  const [coPhone, setCoPhone] = useState('');
  const [coLines, setCoLines] = useState<OrderLine[]>([]);
  const [coProductSearch, setCoProductSearch] = useState('');
  const [coShipping, setCoShipping] = useState('');
  const [coShippingFee, setCoShippingFee] = useState(0);
  const [coPayment, setCoPayment] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [coNote, setCoNote] = useState('');
  const [coShowNewCust, setCoShowNewCust] = useState(false);
  const [coNewName, setCoNewName] = useState('');
  const [coNewPhone, setCoNewPhone] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', typeFilter, statusFilter],
    queryFn: () => getOrders({
      orderType: typeFilter || undefined,
      status: statusFilter || undefined,
    }),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-search', coProductSearch],
    queryFn: () => getProducts({ search: coProductSearch || undefined, pageSize: 30 }),
    enabled: showCreate,
  });
  const searchableProducts = productsData?.data ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => updateOrderStatus(id, 'CANCELLED'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); setCancelTarget(null); },
  });

  const createCustMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: (c) => { setCoCustomer(c); setCoShowNewCust(false); setCoNewName(''); setCoNewPhone(''); },
  });

  const createOrderMut = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      setShowCreate(false);
      resetCreate();
    },
  });

  function resetCreate() {
    setCoCustomer(null); setCoPhone(''); setCoLines([]);
    setCoProductSearch(''); setCoShipping(''); setCoShippingFee(0);
    setCoPayment('CASH'); setCoNote(''); setCoShowNewCust(false);
    setCoNewName(''); setCoNewPhone('');
  }

  async function searchCustomer() {
    if (!coPhone.trim()) return;
    const list = await getCustomers(coPhone.trim());
    if (list.length > 0) setCoCustomer(list[0]);
    else { setCoCustomer(null); setCoShowNewCust(true); setCoNewPhone(coPhone); }
  }

  function addLine(p: Product) {
    setCoLines(prev => {
      const ex = prev.find(l => l.product.productId === p.productId);
      if (ex) return prev.map(l => l.product.productId === p.productId ? { ...l, quantity: l.quantity + 1 } : l);
      return [...prev, { product: p, quantity: 1 }];
    });
    setCoProductSearch('');
  }

  function updateLine(id: string, qty: number) {
    if (qty <= 0) setCoLines(prev => prev.filter(l => l.product.productId !== id));
    else setCoLines(prev => prev.map(l => l.product.productId === id ? { ...l, quantity: qty } : l));
  }

  const coSubtotal = coLines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const coTotal = coSubtotal + coShippingFee;

  function submitCreate() {
    if (!coLines.length || !user?.employeeId || !user?.branchId) return;
    createOrderMut.mutate({
      employeeId: user.employeeId,
      branchId: user.branchId,
      customerId: coCustomer?.customerId,
      orderType: 'online',
      paymentMethod: coPayment.toLowerCase() as 'cash' | 'transfer',
      shippingAddress: coShipping,
      shippingFee: coShippingFee,
      note: coNote,
      details: coLines.map(l => ({ productId: l.product.productId, quantity: l.quantity, unitPrice: l.product.price })),
    });
  }

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
                    <TableRow key={order.orderId} className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpanded(isExpanded ? null : order.orderId)}>
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
                              loading={updateMut.isPending}>
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

                    {isExpanded && (
                      <TableRow key={`${order.orderId}-detail`}>
                        <TableTd colSpan={8} className="bg-gray-50 p-0">
                          <div className="px-6 py-3 space-y-2">
                            {order.shippingAddress && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Truck size={11} /> Giao đến: {order.shippingAddress}
                              </p>
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
                                      <td className="py-1">{d.productName}</td>
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
                              {order.discountAmount > 0 && <span>Giảm: <strong className="text-amber-600">-{formatCurrency(order.discountAmount)}</strong></span>}
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
      <div className="flex items-center gap-3">
        <Select options={TYPE_OPTIONS} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
        <p className="text-sm text-gray-400 ml-auto">{orders.length} đơn hàng</p>
        <Button onClick={() => { setShowCreate(true); resetCreate(); }}>
          <Plus size={14} /> Tạo đơn online
        </Button>
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

      {/* Cancel modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Xác nhận hủy đơn">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Hủy đơn <strong>{cancelTarget?.orderId}</strong> — {cancelTarget?.customerName}?</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Không</Button>
            <Button variant="danger" onClick={() => cancelTarget && cancelMut.mutate(cancelTarget.orderId)} loading={cancelMut.isPending}>
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create online order modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetCreate(); }} title="Tạo đơn hàng Online" size="lg">
        <div className="space-y-4">

          {/* Customer */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Khách hàng</label>
            {coCustomer ? (
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-indigo-800">{coCustomer.fullName}</p>
                  <p className="text-xs text-indigo-500">{coCustomer.phoneNumber} · {coCustomer.customerRank}</p>
                </div>
                <button onClick={() => setCoCustomer(null)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
              </div>
            ) : coShowNewCust ? (
              <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                <p className="text-xs text-gray-500">Không tìm thấy <strong>{coPhone}</strong>. Tạo mới?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Họ tên" value={coNewName} onChange={e => setCoNewName(e.target.value)} />
                  <Input placeholder="SĐT" value={coNewPhone} onChange={e => setCoNewPhone(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setCoShowNewCust(false)}>Bỏ qua</Button>
                  <Button size="sm"
                    onClick={() => createCustMut.mutate({ fullName: coNewName, phoneNumber: coNewPhone })}
                    loading={createCustMut.isPending}
                    disabled={!coNewName || !coNewPhone}>
                    <UserPlus size={12} /> Tạo & dùng
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Nhập SĐT tìm khách..." value={coPhone}
                  onChange={e => setCoPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchCustomer()} />
                <Button size="sm" variant="ghost" onClick={searchCustomer}><UserSearch size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => setCoShowNewCust(true)}><UserPlus size={14} /></Button>
              </div>
            )}
          </div>

          {/* Product search */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Sản phẩm</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                value={coProductSearch}
                onChange={e => setCoProductSearch(e.target.value)}
              />
            </div>
            {coProductSearch && searchableProducts.length > 0 && (
              <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto shadow-sm">
                {searchableProducts.map(p => (
                  <button key={p.productId} onClick={() => addLine(p)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-indigo-50 border-b border-gray-50 last:border-0 text-left">
                    <span>{p.productName} <span className="text-gray-400 text-xs">{p.sku}</span></span>
                    <span className="font-semibold text-indigo-600">{formatCurrency(p.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Cart lines */}
            {coLines.length > 0 && (
              <div className="mt-2 border border-gray-100 rounded-lg divide-y divide-gray-50">
                {coLines.map(l => (
                  <div key={l.product.productId} className="flex items-center gap-2 px-3 py-2">
                    <span className="flex-1 text-sm truncate">{l.product.productName}</span>
                    <span className="text-xs text-gray-400">{formatCurrency(l.product.price)}</span>
                    <input type="number" min={1} value={l.quantity}
                      onChange={e => updateLine(l.product.productId, parseInt(e.target.value) || 0)}
                      className="w-14 text-center border border-gray-200 rounded px-1 py-0.5 text-sm" />
                    <span className="text-xs font-semibold text-gray-700 w-20 text-right">
                      {formatCurrency(l.product.price * l.quantity)}
                    </span>
                    <button onClick={() => updateLine(l.product.productId, 0)} className="text-gray-300 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input label="Địa chỉ giao hàng" placeholder="Số nhà, đường, quận, thành phố..."
                value={coShipping} onChange={e => setCoShipping(e.target.value)} />
            </div>
            <Input label="Phí ship (₫)" type="number" value={coShippingFee}
              onChange={e => setCoShippingFee(parseInt(e.target.value) || 0)} />
          </div>

          {/* Payment & note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Thanh toán</label>
              <div className="flex gap-2">
                {(['CASH', 'TRANSFER'] as const).map(m => (
                  <button key={m} onClick={() => setCoPayment(m)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      coPayment === m ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-indigo-300'
                    }`}>
                    {m === 'CASH' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Ghi chú" placeholder="Ghi chú đơn hàng..."
              value={coNote} onChange={e => setCoNote(e.target.value)} />
          </div>

          {/* Summary & submit */}
          {coLines.length > 0 && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span><span>{formatCurrency(coSubtotal)}</span>
              </div>
              {coShippingFee > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Phí ship</span><span>{formatCurrency(coShippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t pt-1 mt-1">
                <span>Tổng cộng</span>
                <span className="text-indigo-600">{formatCurrency(coTotal)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => { setShowCreate(false); resetCreate(); }}>Hủy</Button>
            <Button onClick={submitCreate}
              disabled={coLines.length === 0}
              loading={createOrderMut.isPending}>
              Tạo đơn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
