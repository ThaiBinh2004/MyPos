"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getProducts, createProduct } from "@/services/sales.service";
import type { ProductFilters, ProductStatus } from "@/types";
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
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Đang bán" },
  { value: "inactive", label: "Ngừng bán" },
];

const schema = z.object({
  sku: z.string().min(1, "Bắt buộc"),
  productName: z.string().min(1, "Bắt buộc"),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  category: z.string().min(1, "Bắt buộc"),
  sizeInfo: z.string().optional(),
  color: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setShowModal(false);
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function handleSearch() {
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
  }

  const products = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sản phẩm</h1>
        <Button onClick={() => setShowModal(true)}>Thêm sản phẩm</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Tìm theo tên, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Select
              options={STATUS_OPTIONS}
              value={filters.status ?? ""}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  status: (v as ProductStatus) || undefined,
                  page: 1,
                }))
              }
            />
            <Button onClick={handleSearch}>Tìm</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>SKU</TableTh>
                <TableTh>Tên sản phẩm</TableTh>
                <TableTh>Danh mục</TableTh>
                <TableTh>Size</TableTh>
                <TableTh>Màu</TableTh>
                <TableTh>Giá</TableTh>
                <TableTh>Trạng thái</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableTd colSpan={7} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </TableTd>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableTd colSpan={7} className="text-center py-8 text-gray-500">
                    Không có sản phẩm
                  </TableTd>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableTd className="font-mono text-sm">{product.sku}</TableTd>
                    <TableTd className="font-medium">{product.productName}</TableTd>
                    <TableTd>{product.category}</TableTd>
                    <TableTd>{product.sizeInfo ?? "—"}</TableTd>
                    <TableTd>{product.color ?? "—"}</TableTd>
                    <TableTd>{formatCurrency(product.price)}</TableTd>
                    <TableTd>
                      <Badge variant={product.status === "active" ? "success" : "error"}>
                        {product.status === "active" ? "Đang bán" : "Ngừng bán"}
                      </Badge>
                    </TableTd>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">Tổng: {total} sản phẩm</div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); reset(); }}
        title="Thêm sản phẩm mới"
      >
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="SKU *" {...register("sku")} error={errors.sku?.message} />
          <Input label="Tên sản phẩm *" {...register("productName")} error={errors.productName?.message} />
          <Input label="Danh mục *" {...register("category")} error={errors.category?.message} />
          <Input
            label="Giá (VNĐ) *"
            type="number"
            {...register("price")}
            error={errors.price?.message}
          />
          <Input label="Size" {...register("sizeInfo")} error={errors.sizeInfo?.message} />
          <Input label="Màu sắc" {...register("color")} error={errors.color?.message} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>
              Hủy
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Tạo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
