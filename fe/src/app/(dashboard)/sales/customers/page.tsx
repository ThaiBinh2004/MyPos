"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, createCustomer, getCustomerOrders } from "@/services/sales.service";
import type { Customer, Order } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UserPlus, Search, History, Crown, Star, Medal, User, Gift } from "lucide-react";

const RANK_CONFIG: Record<string, { label: string; variant: 'default' | 'warning' | 'info' | 'success'; icon: React.ReactNode }> = {
  'VIP':    { label: 'VIP',    variant: 'warning', icon: <Crown size={11} /> },
  'Vàng':   { label: 'Vàng',   variant: 'warning', icon: <Star size={11} /> },
  'Bạc':    { label: 'Bạc',    variant: 'info',    icon: <Medal size={11} /> },
  'Thường': { label: 'Thường', variant: 'default', icon: <User size={11} /> },
};

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [createError, setCreateError] = useState("");

  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(),
  });

  const { data: history = [], isLoading: histLoading } = useQuery({
    queryKey: ["customer-orders", historyCustomer?.customerId],
    queryFn: () => getCustomerOrders(historyCustomer!.customerId),
    enabled: !!historyCustomer,
  });

  const createMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setShowCreate(false);
      setNewName(""); setNewPhone(""); setNewEmail(""); setCreateError("");
    },
    onError: () => setCreateError("Số điện thoại đã tồn tại hoặc có lỗi xảy ra."),
  });

  const filtered = customers.filter(c =>
    (c.fullName.toLowerCase().includes(search.toLowerCase()) ||
     c.phoneNumber.includes(search) ||
     (c.email ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = (orders: Order[]) =>
    orders.filter(o => o.status?.toUpperCase() !== 'CANCELLED')
          .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Tìm theo tên, SĐT, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreate(true)}><UserPlus size={14} /> Thêm khách hàng</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {(['VIP', 'Vàng', 'Bạc', 'Thường'] as const).map(rank => {
          const count = customers.filter(c => c.customerRank === rank).length;
          const cfg = RANK_CONFIG[rank];
          return (
            <Card key={rank}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${rank === 'VIP' ? 'bg-amber-100 text-amber-600' : rank === 'Vàng' ? 'bg-yellow-100 text-yellow-600' : rank === 'Bạc' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">Hạng {rank}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Khách hàng</TableTh>
                <TableTh>Số điện thoại</TableTh>
                <TableTh>Email</TableTh>
                <TableTh>Hạng</TableTh>
                <TableTh>Điểm tích lũy</TableTh>
                <TableTh>Ngày đăng ký</TableTh>
                <TableTh>Lịch sử</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableTd colSpan={7} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableTd colSpan={7} className="text-center py-8 text-gray-400">Không có khách hàng</TableTd></TableRow>
              ) : filtered.map(c => {
                const cfg = RANK_CONFIG[c.customerRank] ?? RANK_CONFIG['Thường'];
                return (
                  <TableRow key={c.customerId}>
                    <TableTd>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-sm">{c.fullName}</p>
                      </div>
                    </TableTd>
                    <TableTd className="font-mono text-sm">{c.phoneNumber}</TableTd>
                    <TableTd className="text-sm text-gray-500">{c.email ?? "—"}</TableTd>
                    <TableTd>
                      <Badge variant={cfg.variant}>
                        <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
                      </Badge>
                    </TableTd>
                    <TableTd>
                      <span className="flex items-center gap-1 text-sm">
                        <Gift size={12} className="text-amber-500" />
                        <span className="font-semibold">{c.loyaltyPoints.toLocaleString('vi-VN')}</span>
                        <span className="text-gray-400 text-xs">điểm</span>
                      </span>
                    </TableTd>
                    <TableTd className="text-sm text-gray-500">{formatDate(c.createdAt)}</TableTd>
                    <TableTd>
                      <Button size="sm" variant="ghost" onClick={() => setHistoryCustomer(c)}>
                        <History size={13} /> Xem
                      </Button>
                    </TableTd>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Thêm khách hàng */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreateError(""); }} title="Thêm khách hàng mới">
        <div className="space-y-3">
          <Input label="Họ tên *" value={newName} onChange={e => setNewName(e.target.value)} />
          <Input label="Số điện thoại *" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          <Input label="Email (tuỳ chọn)" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          {createError && <p className="text-sm text-red-500">{createError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => { setShowCreate(false); setCreateError(""); }}>Hủy</Button>
            <Button
              onClick={() => createMut.mutate({ fullName: newName, phoneNumber: newPhone, email: newEmail || undefined })}
              loading={createMut.isPending}
              disabled={!newName || !newPhone}
            >
              Thêm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Lịch sử mua hàng */}
      <Modal open={!!historyCustomer} onClose={() => setHistoryCustomer(null)}
        title={`Lịch sử mua hàng — ${historyCustomer?.fullName}`} size="lg">
        {historyCustomer && (
          <div className="space-y-3">
            {/* Customer summary */}
            <div className="flex gap-4 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm">
              <div><p className="text-xs text-indigo-400">Tổng đơn</p><p className="font-bold text-indigo-700">{history.length}</p></div>
              <div><p className="text-xs text-indigo-400">Doanh thu</p><p className="font-bold text-indigo-700">{formatCurrency(totalRevenue(history))}</p></div>
              <div><p className="text-xs text-indigo-400">Điểm tích lũy</p><p className="font-bold text-amber-600 flex items-center gap-1"><Gift size={12} />{historyCustomer.loyaltyPoints.toLocaleString('vi-VN')}</p></div>
              <div><p className="text-xs text-indigo-400">Hạng</p><p className="font-bold">{historyCustomer.customerRank}</p></div>
            </div>

            {histLoading ? (
              <p className="text-center py-6 text-gray-400">Đang tải...</p>
            ) : history.length === 0 ? (
              <p className="text-center py-6 text-gray-400">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1.5">
                {history.map(o => {
                  const statusKey = o.status?.toUpperCase();
                  const statusLabel: Record<string, string> = {
                    COMPLETED: 'Hoàn thành', PENDING: 'Chờ xử lý', CANCELLED: 'Đã hủy',
                    CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao',
                  };
                  const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
                    COMPLETED: 'success', PENDING: 'warning', CANCELLED: 'error',
                    CONFIRMED: 'info', SHIPPING: 'default',
                  };
                  return (
                    <div key={o.orderId} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                      <div>
                        <p className="font-mono text-xs text-gray-500">{o.orderId}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.createdAt)} · {o.orderType?.toUpperCase() === 'ONLINE' ? 'Online' : 'Tại quầy'} · {o.paymentMethod}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-indigo-600">{formatCurrency(o.totalAmount)}</span>
                        <Badge variant={statusVariant[statusKey] ?? 'default'}>{statusLabel[statusKey] ?? statusKey}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
