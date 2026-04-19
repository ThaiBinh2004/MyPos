"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, getPromotions, createPromotion, updatePromotion, deletePromotion,
  uploadProductImage,
} from "@/services/sales.service";
import type { Product, ProductFilters, Promotion, CreatePromotionPayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableTh, TableTd } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isManager } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";
import { Pencil, Trash2, Plus, Upload, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang bán" },
  { value: "INACTIVE", label: "Ngừng bán" },
];

const productSchema = z.object({
  sku: z.string().min(1, "Bắt buộc"),
  productName: z.string().min(1, "Bắt buộc"),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  categoryId: z.string().min(1, "Bắt buộc"),
  sizeInfo: z.string().optional(),
  color: z.string().optional(),
  imageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});
type ProductForm = z.infer<typeof productSchema>;

const promoSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  code: z.string().optional(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});
type PromoForm = z.infer<typeof promoSchema>;

export default function ProductsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const manager = isManager(user?.role ?? '');

  const [tab, setTab] = useState<'products' | 'promotions'>('products');
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState("");

  // Product modals
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Promo modals
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [deletePromoTarget, setDeletePromoTarget] = useState<Promotion | null>(null);
  const [showCreatePromo, setShowCreatePromo] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["products", filters], queryFn: () => getProducts(filters) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: promotions = [], isLoading: promoLoading } = useQuery({ queryKey: ["promotions"], queryFn: getPromotions });

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const catOptions = (categories ?? []).map(c => ({ value: c.categoryId, label: c.categoryName }));

  const {
    register: regP, handleSubmit: hsP, reset: resetP, setValue: svP,
    formState: { errors: errP },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  const {
    register: regPr, handleSubmit: hsPr, reset: resetPr, setValue: svPr,
    formState: { errors: errPr },
  } = useForm<PromoForm>({ resolver: zodResolver(promoSchema) });

  // Product mutations
  const createMut = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setShowCreate(false); setImagePreview(""); resetP(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductForm> }) => updateProduct(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setEditProduct(null); setImagePreview(""); resetP(); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setDeleteTarget(null); },
  });

  // Promo mutations
  const createPromoMut = useMutation({
    mutationFn: (p: CreatePromotionPayload) => createPromotion(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promotions"] }); setShowCreatePromo(false); resetPr(); },
  });
  const updatePromoMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PromoForm & { active: boolean }> }) => updatePromotion(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promotions"] }); setEditPromo(null); resetPr(); },
  });
  const deletePromoMut = useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["promotions"] }); setDeletePromoTarget(null); },
  });

  function openEdit(p: Product) {
    setEditProduct(p);
    svP("sku", p.sku); svP("productName", p.productName);
    svP("price", p.price); svP("categoryId", p.categoryId);
    svP("sizeInfo", p.sizeInfo ?? ""); svP("color", p.color ?? "");
    svP("imageUrl", p.imageUrl ?? "");
    setImagePreview(p.imageUrl ?? "");
  }

  async function handleImageFile(file: File) {
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      svP("imageUrl", `http://localhost:8080${url}`);
    } finally {
      setUploading(false);
    }
  }

  function openEditPromo(p: Promotion) {
    setEditPromo(p);
    svPr("name", p.name); svPr("code", p.code ?? "");
    svPr("discountType", p.discountType); svPr("discountValue", p.discountValue);
    svPr("minOrderAmount", p.minOrderAmount ?? 0);
    svPr("startDate", p.startDate ?? ""); svPr("endDate", p.endDate ?? "");
    svPr("description", p.description ?? "");
  }

  const promoIsActive = (p: Promotion) => {
    if (!p.active) return false;
    const today = new Date().toISOString().split('T')[0];
    if (p.startDate && today < p.startDate) return false;
    if (p.endDate && today > p.endDate) return false;
    return true;
  };

  return (
    <div className="p-6 space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setTab('products')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Sản phẩm
          </button>
          <button onClick={() => setTab('promotions')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'promotions' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Khuyến mãi
          </button>
        </div>
        {manager && tab === 'products' && (
          <Button onClick={() => { setShowCreate(true); setImagePreview(""); resetP(); }}><Plus size={14} /> Thêm sản phẩm</Button>
        )}
        {manager && tab === 'promotions' && (
          <Button onClick={() => { setShowCreatePromo(true); resetPr(); }}><Plus size={14} /> Tạo khuyến mãi</Button>
        )}
      </div>

      {/* === PRODUCTS TAB === */}
      {tab === 'products' && (
        <>
          <div className="flex flex-wrap gap-3">
            <Input placeholder="Tìm theo tên, SKU..." value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setFilters(f => ({ ...f, search: search || undefined, page: 1 }))} />
            <Select options={[{ value: "", label: "Tất cả danh mục" }, ...catOptions]}
              value={filters.categoryId ?? ""}
              onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value || undefined, page: 1 }))} />
            <Select options={STATUS_OPTIONS} value={filters.status ?? ""}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined, page: 1 }))} />
            <Button onClick={() => setFilters(f => ({ ...f, search: search || undefined, page: 1 }))}>Tìm</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableTh>Ảnh</TableTh><TableTh>SKU</TableTh><TableTh>Tên sản phẩm</TableTh>
                    <TableTh>Danh mục</TableTh><TableTh>Size</TableTh><TableTh>Màu</TableTh>
                    <TableTh>Giá</TableTh><TableTh>Trạng thái</TableTh>
                    {manager && <TableTh>Thao tác</TableTh>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableTd colSpan={9} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                  ) : products.length === 0 ? (
                    <TableRow><TableTd colSpan={9} className="text-center py-8 text-gray-400">Không có sản phẩm</TableTd></TableRow>
                  ) : products.map(p => {
                    const isActive = p.status?.toUpperCase() === 'ACTIVE';
                    return (
                      <TableRow key={p.productId}>
                        <TableTd>{p.imageUrl
                          ? <img src={p.imageUrl} alt={p.productName} className="w-10 h-10 object-cover rounded" />
                          : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-300">N/A</div>}
                        </TableTd>
                        <TableTd className="font-mono text-sm">{p.sku}</TableTd>
                        <TableTd className="font-medium">{p.productName}</TableTd>
                        <TableTd>{p.categoryName}</TableTd>
                        <TableTd>{p.sizeInfo ?? "—"}</TableTd>
                        <TableTd>{p.color ?? "—"}</TableTd>
                        <TableTd>{formatCurrency(p.price)}</TableTd>
                        <TableTd>
                          <Badge variant={isActive ? "success" : "error"}>{isActive ? "Đang bán" : "Ngừng bán"}</Badge>
                        </TableTd>
                        {manager && (
                          <TableTd>
                            <div className="flex gap-1.5">
                              <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-indigo-50 text-indigo-500"><Pencil size={13} /></button>
                              <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                            </div>
                          </TableTd>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Pagination page={filters.page ?? 1} total={total} pageSize={filters.pageSize ?? 20}
            onChange={p => setFilters(f => ({ ...f, page: p }))} />
        </>
      )}

      {/* === PROMOTIONS TAB === */}
      {tab === 'promotions' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Tên chương trình</TableTh><TableTh>Mã</TableTh><TableTh>Loại giảm</TableTh>
                  <TableTh>Giá trị</TableTh><TableTh>ĐH tối thiểu</TableTh>
                  <TableTh>Thời gian</TableTh><TableTh>Trạng thái</TableTh>
                  {manager && <TableTh>Thao tác</TableTh>}
                </TableRow>
              </TableHead>
              <TableBody>
                {promoLoading ? (
                  <TableRow><TableTd colSpan={8} className="text-center py-8 text-gray-400">Đang tải...</TableTd></TableRow>
                ) : promotions.length === 0 ? (
                  <TableRow><TableTd colSpan={8} className="text-center py-8 text-gray-400">Chưa có chương trình khuyến mãi</TableTd></TableRow>
                ) : promotions.map(p => {
                  const active = promoIsActive(p);
                  return (
                    <TableRow key={p.promotionId}>
                      <TableTd>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-400 truncate max-w-45">{p.description}</p>}
                      </TableTd>
                      <TableTd>{p.code ? <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{p.code}</span> : "—"}</TableTd>
                      <TableTd><Badge variant="info">{p.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</Badge></TableTd>
                      <TableTd className="font-semibold">
                        {p.discountType === 'PERCENT' ? `${p.discountValue}%` : formatCurrency(p.discountValue)}
                      </TableTd>
                      <TableTd>{p.minOrderAmount > 0 ? formatCurrency(p.minOrderAmount) : "—"}</TableTd>
                      <TableTd className="text-xs text-gray-500">
                        {p.startDate ? formatDate(p.startDate) : "—"} → {p.endDate ? formatDate(p.endDate) : "∞"}
                      </TableTd>
                      <TableTd><Badge variant={active ? "success" : "error"}>{active ? "Đang chạy" : "Không hoạt động"}</Badge></TableTd>
                      {manager && (
                        <TableTd>
                          <div className="flex gap-1.5">
                            <button onClick={() => openEditPromo(p)} className="p-1.5 rounded hover:bg-indigo-50 text-indigo-500"><Pencil size={13} /></button>
                            <button onClick={() => setDeletePromoTarget(p)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                          </div>
                        </TableTd>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal: Thêm/sửa sản phẩm */}
      {(showCreate || !!editProduct) && (
        <Modal open onClose={() => { setShowCreate(false); setEditProduct(null); resetP(); }}
          title={editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}>
          <form onSubmit={hsP(d => {
            const payload = { ...d, imageUrl: d.imageUrl || undefined };
            if (editProduct) updateMut.mutate({ id: editProduct.productId, payload });
            else createMut.mutate(payload);
          })} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="SKU *" {...regP("sku")} error={errP.sku?.message} />
              <Input label="Giá (VNĐ) *" type="number" {...regP("price")} error={errP.price?.message} />
            </div>
            <Input label="Tên sản phẩm *" {...regP("productName")} error={errP.productName?.message} />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Danh mục *</label>
              <Select options={catOptions} value="" onChange={() => {}} {...regP("categoryId")} />
              {errP.categoryId && <p className="text-xs text-red-500 mt-1">{errP.categoryId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Size" {...regP("sizeInfo")} />
              <Input label="Màu sắc" {...regP("color")} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Hình ảnh</label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
              {imagePreview ? (
                <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => { setImagePreview(""); svP("imageUrl", ""); }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">Đang tải lên...</div>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-colors">
                  <Upload size={20} />
                  <span className="text-xs">Click để chọn ảnh</span>
                </button>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => { setShowCreate(false); setEditProduct(null); setImagePreview(""); resetP(); }}>Hủy</Button>
              <Button type="submit" loading={createMut.isPending || updateMut.isPending}>
                {editProduct ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Xoá sản phẩm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xoá sản phẩm">
        <p className="text-sm text-gray-600 mb-4">Xoá <strong>{deleteTarget?.productName}</strong>? Thao tác không thể hoàn tác.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.productId)} loading={deleteMut.isPending}>Xoá</Button>
        </div>
      </Modal>

      {/* Modal: Tạo/sửa khuyến mãi */}
      {(showCreatePromo || !!editPromo) && (
        <Modal open onClose={() => { setShowCreatePromo(false); setEditPromo(null); resetPr(); }}
          title={editPromo ? "Cập nhật khuyến mãi" : "Tạo chương trình khuyến mãi"} size="lg">
          <form onSubmit={hsPr(d => {
            if (editPromo) updatePromoMut.mutate({ id: editPromo.promotionId, payload: d });
            else createPromoMut.mutate(d);
          })} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Tên chương trình *" {...regPr("name")} error={errPr.name?.message} />
              <Input label="Mã giảm giá (tuỳ chọn)" placeholder="SALE20" {...regPr("code")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Loại giảm *</label>
                <Select options={[{ value: "PERCENT", label: "Phần trăm (%)" }, { value: "FIXED", label: "Số tiền cố định (₫)" }]}
                  value="PERCENT" onChange={() => {}} {...regPr("discountType")} />
              </div>
              <Input label="Giá trị giảm *" type="number" {...regPr("discountValue")} error={errPr.discountValue?.message} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Đơn hàng tối thiểu (₫)" type="number" {...regPr("minOrderAmount")} />
              <Input label="Giảm tối đa (₫)" type="number" {...regPr("maxDiscountAmount")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ngày bắt đầu" type="date" {...regPr("startDate")} />
              <Input label="Ngày kết thúc" type="date" {...regPr("endDate")} />
            </div>
            <Input label="Mô tả" {...regPr("description")} />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => { setShowCreatePromo(false); setEditPromo(null); resetPr(); }}>Hủy</Button>
              <Button type="submit" loading={createPromoMut.isPending || updatePromoMut.isPending}>
                {editPromo ? "Cập nhật" : "Tạo"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Xoá khuyến mãi */}
      <Modal open={!!deletePromoTarget} onClose={() => setDeletePromoTarget(null)} title="Xoá khuyến mãi">
        <p className="text-sm text-gray-600 mb-4">Xoá chương trình <strong>{deletePromoTarget?.name}</strong>?</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeletePromoTarget(null)}>Hủy</Button>
          <Button variant="danger" onClick={() => deletePromoTarget && deletePromoMut.mutate(deletePromoTarget.promotionId)} loading={deletePromoMut.isPending}>Xoá</Button>
        </div>
      </Modal>
    </div>
  );
}
