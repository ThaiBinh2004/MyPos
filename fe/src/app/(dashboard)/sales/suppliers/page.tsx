"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
} from "@/services/sales.service";
import type { PurchaseOrderStatus } from "@/types";
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
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { isManager } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";

const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  pending: "Chờ nhập",
  partial: "Nhập một phần",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const PO_STATUS_VARIANT: Record<
  PurchaseOrderStatus,
  "default" | "success" | "warning" | "error" | "info"
> = {
  pending: "warning",
  partial: "info",
  completed: "success",
  cancelled: "error",
};

const supplierSchema = z.object({
  supplierName: z.string().min(1, "Bắt buộc"),
  contact: z.string().min(1, "Bắt buộc"),
  phoneNumber: z.string().min(1, "Bắt buộc"),
  address: z.string().min(1, "Bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

type Tab = "suppliers" | "purchase-orders";

export default function SuppliersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const manager = isManager(user?.role ?? '');
  const [tab, setTab] = useState<Tab>("suppliers");
  const [showModal, setShowModal] = useState(false);

  const { data: suppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  const { data: purchaseOrders, isLoading: loadingPOs } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => getPurchaseOrders(),
    enabled: tab === "purchase-orders",
  });

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setShowModal(false);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({ resolver: zodResolver(supplierSchema) });

  return (
    <div className="p-6 space-y-4">
      {tab === "suppliers" && manager && (
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>Thêm nhà cung cấp</Button>
        </div>
      )}

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "suppliers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("suppliers")}
        >
          Nhà cung cấp
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "purchase-orders"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setTab("purchase-orders")}
        >
          Đơn nhập hàng
        </button>
      </div>

      {tab === "suppliers" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Tên nhà cung cấp</TableTh>
                  <TableTh>Người liên hệ</TableTh>
                  <TableTh>Điện thoại</TableTh>
                  <TableTh>Email</TableTh>
                  <TableTh>Địa chỉ</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSuppliers ? (
                  <TableRow>
                    <TableTd colSpan={5} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </TableTd>
                  </TableRow>
                ) : !suppliers?.length ? (
                  <TableRow>
                    <TableTd colSpan={5} className="text-center py-8 text-gray-500">
                      Chưa có nhà cung cấp
                    </TableTd>
                  </TableRow>
                ) : (
                  suppliers.map((s) => (
                    <TableRow key={s.supplierId}>
                      <TableTd className="font-medium">{s.supplierName}</TableTd>
                      <TableTd>{s.contact}</TableTd>
                      <TableTd>{s.phoneNumber}</TableTd>
                      <TableTd>{s.email ?? "—"}</TableTd>
                      <TableTd>{s.address}</TableTd>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "purchase-orders" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Mã đơn</TableTh>
                  <TableTh>Nhà cung cấp</TableTh>
                  <TableTh>Chi nhánh</TableTh>
                  <TableTh>Ngày đặt</TableTh>
                  <TableTh>Trạng thái</TableTh>
                  <TableTh>Ghi chú</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPOs ? (
                  <TableRow>
                    <TableTd colSpan={6} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </TableTd>
                  </TableRow>
                ) : !purchaseOrders?.length ? (
                  <TableRow>
                    <TableTd colSpan={6} className="text-center py-8 text-gray-500">
                      Chưa có đơn nhập hàng
                    </TableTd>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => (
                    <TableRow key={po.poId}>
                      <TableTd className="font-mono text-sm">{po.poId}</TableTd>
                      <TableTd>{po.supplierName}</TableTd>
                      <TableTd>{po.branchId}</TableTd>
                      <TableTd>{formatDate(po.date)}</TableTd>
                      <TableTd>
                        <Badge variant={PO_STATUS_VARIANT[po.status]}>
                          {PO_STATUS_LABELS[po.status]}
                        </Badge>
                      </TableTd>
                      <TableTd>{po.note ?? "—"}</TableTd>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); reset(); }}
        title="Thêm nhà cung cấp"
      >
        <form
          onSubmit={handleSubmit((d) =>
            createSupplierMutation.mutate({
              ...d,
              email: d.email || undefined,
            })
          )}
          className="space-y-4"
        >
          <Input
            label="Tên nhà cung cấp *"
            {...register("supplierName")}
            error={errors.supplierName?.message}
          />
          <Input
            label="Người liên hệ *"
            {...register("contact")}
            error={errors.contact?.message}
          />
          <Input
            label="Số điện thoại *"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
          />
          <Input
            label="Địa chỉ *"
            {...register("address")}
            error={errors.address?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowModal(false); reset(); }}
            >
              Hủy
            </Button>
            <Button type="submit" loading={createSupplierMutation.isPending}>
              Tạo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
