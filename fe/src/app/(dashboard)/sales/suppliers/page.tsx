"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getSuppliers, createSupplier,
  getPurchaseOrders, createPurchaseOrderFull,
  receivePurchaseOrder, getPurchaseOrderDetails,
  getProducts,
} from "@/services/sales.service";
import type { PurchaseOrder, PurchaseOrderDetail } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { isManager } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";
import React from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, CheckCircle } from "lucide-react";

const BRANCH_OPTIONS = [
  { value: "BR001", label: "Chi nhánh Quận 1" },
  { value: "BR002", label: "Chi nhánh Quận 3" },
  { value: "BR003", label: "Chi nhánh Bình Thạnh" },
];

const PO_STATUS: Record<string, { label: string; variant: "warning" | "success" | "error" | "default" }> = {
  PENDING:   { label: "Chờ nhận", variant: "warning" },
  RECEIVED:  { label: "Đã nhận",  variant: "success" },
  CANCELLED: { label: "Đã hủy",   variant: "error" },
};

const supplierSchema = z.object({
  supplierName: z.string().min(1, "Bắt buộc"),
  contact:      z.string().min(1, "Bắt buộc"),
  phoneNumber:  z.string().min(1, "Bắt buộc"),
  address:      z.string().min(1, "Bắt buộc"),
  email:        z.string().email("Email không hợp lệ").optional().or(z.literal("")),
});
type SupplierForm = z.infer<typeof supplierSchema>;

interface POLine { productId: string; productName: string; quantityOrdered: number; }

function PODetailRow({ po }: { po: PurchaseOrder }) {
  const { data: details = [], isLoading } = useQuery({
    queryKey: ["po-details", po.poId],
    queryFn: () => getPurchaseOrderDetails(po.poId),
  });
  if (isLoading) return <p className="text-xs text-gray-400 py-2">Đang tải...</p>;
  if (!details.length) return <p className="text-xs text-gray-400 py-2 italic">Không có chi tiết</p>;
  return (
    <table className="w-full text-xs mt-1">
      <thead>
        <tr className="text-gray-400 border-b">
          <th className="text-left py-1 font-medium">Sản phẩm</th>
          <th className="text-right py-1 font-medium">SL đặt</th>
          <th className="text-right py-1 font-medium">SL nhận</th>
        </tr>
      </thead>
      <tbody>
        {details.map((d: PurchaseOrderDetail) => (
          <tr key={d.detailId} className="border-b border-gray-50">
            <td className="py-1">{d.productName}</td>
            <td className="text-right">{d.quantityOrdered}</td>
            <td className={`text-right font-semibold ${d.quantityReceived > 0 ? "text-green-600" : "text-gray-400"}`}>
              {d.quantityReceived}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SuppliersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const manager = isManager(user?.role ?? "");
  const defaultBranch = user?.branchId ?? "BR001";

  const [tab, setTab] = useState<"suppliers" | "purchase-orders">("suppliers");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // PO create form state
  const [poSupplier, setPoSupplier] = useState("");
  const [poBranch, setPoBranch] = useState(defaultBranch);
  const [poNote, setPoNote] = useState("");
  const [poLines, setPoLines] = useState<POLine[]>([]);
  const [lineProduct, setLineProduct] = useState("");
  const [lineQty, setLineQty] = useState("1");
  const [productSearch, setProductSearch] = useState("");

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
  const { data: purchaseOrders = [], isLoading: loadingPOs } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => getPurchaseOrders(),
    enabled: tab === "purchase-orders",
  });
  const { data: productsData } = useQuery({
    queryKey: ["products-po", productSearch],
    queryFn: () => getProducts({ search: productSearch || undefined, pageSize: 30 }),
    enabled: showPOModal,
  });
  const productList = productsData?.data ?? [];

  const supplierOptions = [
    { value: "", label: "Chọn nhà cung cấp..." },
    ...suppliers.map(s => ({ value: s.supplierId, label: s.supplierName })),
  ];

  const receiveMut = useMutation({
    mutationFn: receivePurchaseOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-low"] });
    },
  });

  const createPOMut = useMutation({
    mutationFn: createPurchaseOrderFull,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      setShowPOModal(false);
      resetPOForm();
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
  });
  const createSupplierMut = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); setShowSupplierModal(false); reset(); },
  });

  function resetPOForm() {
    setPoSupplier(""); setPoBranch(defaultBranch); setPoNote("");
    setPoLines([]); setLineProduct(""); setLineQty("1"); setProductSearch("");
  }

  function addLine() {
    const p = productList.find(p => p.productId === lineProduct);
    if (!p || !lineQty) return;
    const qty = parseInt(lineQty);
    if (qty <= 0) return;
    setPoLines(prev => {
      const ex = prev.find(l => l.productId === p.productId);
      if (ex) return prev.map(l => l.productId === p.productId ? { ...l, quantityOrdered: l.quantityOrdered + qty } : l);
      return [...prev, { productId: p.productId, productName: p.productName, quantityOrdered: qty }];
    });
    setLineProduct(""); setLineQty("1"); setProductSearch("");
  }

  function submitPO() {
    if (!poSupplier || !poLines.length) return;
    createPOMut.mutate({
      supplierId: poSupplier,
      branchId: poBranch,
      note: poNote || undefined,
      details: poLines.map(l => ({ productId: l.productId, quantityOrdered: l.quantityOrdered })),
    });
  }

  return (
    <div className="p-6 space-y-4">
      {/* Tabs + actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["suppliers", "purchase-orders"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "suppliers" ? "Nhà cung cấp" : "Đơn nhập hàng"}
            </button>
          ))}
        </div>
        {manager && (
          <div className="flex gap-2">
            {tab === "suppliers" && (
              <Button onClick={() => setShowSupplierModal(true)}><Plus size={14} /> Thêm NCC</Button>
            )}
            {tab === "purchase-orders" && (
              <Button onClick={() => { resetPOForm(); setShowPOModal(true); }}><Plus size={14} /> Tạo đơn nhập</Button>
            )}
          </div>
        )}
      </div>

      {/* Suppliers table */}
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
                  <TableRow><TableTd colSpan={5} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                ) : !suppliers.length ? (
                  <TableRow><TableTd colSpan={5} className="text-center py-8 text-gray-400">Chưa có nhà cung cấp</TableTd></TableRow>
                ) : suppliers.map(s => (
                  <TableRow key={s.supplierId}>
                    <TableTd className="font-medium">{s.supplierName}</TableTd>
                    <TableTd>{s.contact}</TableTd>
                    <TableTd>{s.phoneNumber}</TableTd>
                    <TableTd>{s.email ?? "—"}</TableTd>
                    <TableTd>{s.address}</TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Purchase orders table */}
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
                  {manager && <TableTh>Thao tác</TableTh>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPOs ? (
                  <TableRow><TableTd colSpan={7} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                ) : !purchaseOrders.length ? (
                  <TableRow><TableTd colSpan={7} className="text-center py-8 text-gray-400">Chưa có đơn nhập hàng</TableTd></TableRow>
                ) : (purchaseOrders as PurchaseOrder[]).map(po => {
                  const status = po.status?.toUpperCase();
                  const cfg = PO_STATUS[status] ?? { label: status, variant: "default" as const };
                  const isExpanded = expanded === po.poId;
                  return (
                    <React.Fragment key={po.poId}>
                      <TableRow className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpanded(isExpanded ? null : po.poId)}>
                        <TableTd>
                          <div className="flex items-center gap-1">
                            {isExpanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                            <span className="font-mono text-sm">{po.poId}</span>
                          </div>
                        </TableTd>
                        <TableTd className="font-medium">{po.supplierName}</TableTd>
                        <TableTd>{po.branchName ?? po.branchId}</TableTd>
                        <TableTd className="text-sm text-gray-500">{formatDate(po.date)}</TableTd>
                        <TableTd><Badge variant={cfg.variant}>{cfg.label}</Badge></TableTd>
                        <TableTd className="text-sm text-gray-500">{po.note ?? "—"}</TableTd>
                        {manager && (
                          <TableTd onClick={e => e.stopPropagation()}>
                            {status === "PENDING" && (
                              <Button size="sm"
                                onClick={() => receiveMut.mutate(po.poId)}
                                loading={receiveMut.isPending}>
                                <CheckCircle size={12} /> Nhận hàng
                              </Button>
                            )}
                          </TableTd>
                        )}
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableTd colSpan={manager ? 7 : 6} className="bg-gray-50 px-8 py-3">
                            <PODetailRow po={po} />
                          </TableTd>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal: Thêm nhà cung cấp */}
      <Modal open={showSupplierModal} onClose={() => { setShowSupplierModal(false); reset(); }} title="Thêm nhà cung cấp">
        <form onSubmit={handleSubmit(d => createSupplierMut.mutate({ ...d, email: d.email || undefined }))} className="space-y-3">
          <Input label="Tên nhà cung cấp *" {...register("supplierName")} error={errors.supplierName?.message} />
          <Input label="Người liên hệ *" {...register("contact")} error={errors.contact?.message} />
          <Input label="Số điện thoại *" {...register("phoneNumber")} error={errors.phoneNumber?.message} />
          <Input label="Địa chỉ *" {...register("address")} error={errors.address?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => { setShowSupplierModal(false); reset(); }}>Hủy</Button>
            <Button type="submit" loading={createSupplierMut.isPending}>Thêm</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Tạo đơn nhập hàng */}
      <Modal open={showPOModal} onClose={() => { setShowPOModal(false); resetPOForm(); }} title="Tạo đơn nhập hàng" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nhà cung cấp *</label>
              <Select options={supplierOptions} value={poSupplier} onChange={e => setPoSupplier(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Chi nhánh nhận *</label>
              <Select options={BRANCH_OPTIONS} value={poBranch} onChange={e => setPoBranch(e.target.value)} />
            </div>
          </div>

          {/* Thêm sản phẩm */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Sản phẩm</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Tìm sản phẩm..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
                {productSearch && productList.length > 0 && !lineProduct && (
                  <div className="mt-1 border border-gray-200 rounded-lg max-h-36 overflow-y-auto shadow-sm">
                    {productList.map(p => (
                      <button key={p.productId} onClick={() => { setLineProduct(p.productId); setProductSearch(p.productName); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-indigo-50 border-b border-gray-50 last:border-0 text-left">
                        <span>{p.productName} <span className="text-gray-400 text-xs">{p.sku}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="number" min={1} value={lineQty} onChange={e => setLineQty(e.target.value)}
                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="SL" />
              <Button onClick={addLine} disabled={!lineProduct || !lineQty}><Plus size={14} /></Button>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          {poLines.length > 0 && (
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-50">
              {poLines.map(l => (
                <div key={l.productId} className="flex items-center gap-3 px-3 py-2">
                  <p className="flex-1 text-sm">{l.productName}</p>
                  <input type="number" min={1} value={l.quantityOrdered}
                    onChange={e => setPoLines(prev => prev.map(x => x.productId === l.productId ? { ...x, quantityOrdered: parseInt(e.target.value) || 1 } : x))}
                    className="w-16 text-center border border-gray-200 rounded px-1 py-0.5 text-sm" />
                  <span className="text-xs text-gray-400">cái</span>
                  <button onClick={() => setPoLines(prev => prev.filter(x => x.productId !== l.productId))} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Input label="Ghi chú" placeholder="Ghi chú đơn nhập..." value={poNote} onChange={e => setPoNote(e.target.value)} />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => { setShowPOModal(false); resetPOForm(); }}>Hủy</Button>
            <Button onClick={submitPO} disabled={!poSupplier || !poLines.length} loading={createPOMut.isPending}>
              Tạo đơn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
