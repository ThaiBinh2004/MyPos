"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "@/services/sales.service";
import type { OrderStatus, OrderFilters } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableTh,
  TableTd,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "success" | "warning" | "error" | "info"
> = {
  pending: "warning",
  confirmed: "info",
  shipping: "default",
  completed: "success",
  cancelled: "error",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "shipping",
  shipping: "completed",
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    pageSize: 20,
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateOrderStatus(id, "cancelled"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  function handleDateFilter() {
    setFilters((f) => ({ ...f, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, page: 1 }));
  }

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-4">

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <Select
              options={STATUS_OPTIONS}
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: (e.target.value as OrderStatus) || undefined,
                  page: 1,
                }))
              }
            />
            <Input
              type="date"
              label="Từ ngày"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              label="Đến ngày"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <Button onClick={handleDateFilter}>Lọc</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Mã đơn</TableTh>
                <TableTh>Khách hàng</TableTh>
                <TableTh>Chi nhánh</TableTh>
                <TableTh>Loại</TableTh>
                <TableTh>Tổng tiền</TableTh>
                <TableTh>Trạng thái</TableTh>
                <TableTh>Ngày tạo</TableTh>
                <TableTh>Thao tác</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableTd colSpan={8} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </TableTd>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableTd colSpan={8} className="text-center py-8 text-gray-500">
                    Không có đơn hàng
                  </TableTd>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableTd className="font-mono text-sm">{order.orderId}</TableTd>
                    <TableTd>{order.customerName}</TableTd>
                    <TableTd>{order.branchName}</TableTd>
                    <TableTd>{order.orderType === "online" ? "Online" : "Tại cửa hàng"}</TableTd>
                    <TableTd>{formatCurrency(order.totalAmount)}</TableTd>
                    <TableTd>
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </TableTd>
                    <TableTd>{formatDate(order.createdAt)}</TableTd>
                    <TableTd>
                      <div className="flex gap-2">
                        {NEXT_STATUS[order.status] && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateMutation.mutate({
                                id: order.orderId,
                                status: NEXT_STATUS[order.status]!,
                              })
                            }
                            loading={updateMutation.isPending}
                          >
                            {STATUS_LABELS[NEXT_STATUS[order.status]!]}
                          </Button>
                        )}
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => cancelMutation.mutate(order.orderId)}
                            loading={cancelMutation.isPending}
                          >
                            Hủy
                          </Button>
                        )}
                      </div>
                    </TableTd>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={filters.page ?? 1}
        total={total}
        pageSize={filters.pageSize ?? 20}
        onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />
    </div>
  );
}
