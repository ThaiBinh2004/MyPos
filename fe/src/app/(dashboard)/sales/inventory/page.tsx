"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/services/sales.service";
import type { InventoryFilters } from "@/types";
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
import { formatDate } from "@/lib/utils";

const BRANCH_OPTIONS = [
  { value: "", label: "Tất cả chi nhánh" },
  { value: "CN01", label: "Chi nhánh 1" },
  { value: "CN02", label: "Chi nhánh 2" },
  { value: "CN03", label: "Chi nhánh 3" },
];

export default function InventoryPage() {
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", filters],
    queryFn: () => getInventory(filters),
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tồn kho</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select
              options={BRANCH_OPTIONS}
              value={filters.branchId ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, branchId: e.target.value || undefined, page: 1 }))
              }
            />
            <Button
              variant={filters.lowStock ? "default" : "outline"}
              onClick={() =>
                setFilters((f) => ({ ...f, lowStock: !f.lowStock, page: 1 }))
              }
            >
              Sắp hết hàng
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Sản phẩm</TableTh>
                <TableTh>Chi nhánh</TableTh>
                <TableTh>Số lượng</TableTh>
                <TableTh>Ngưỡng tối thiểu</TableTh>
                <TableTh>Tình trạng</TableTh>
                <TableTh>Cập nhật lần cuối</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableTd colSpan={6} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </TableTd>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableTd colSpan={6} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableTd>
                </TableRow>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <TableRow key={item.inventoryId}>
                      <TableTd className="font-medium">{item.productName}</TableTd>
                      <TableTd>{item.branchId}</TableTd>
                      <TableTd>{item.quantity}</TableTd>
                      <TableTd>{item.minThreshold}</TableTd>
                      <TableTd>
                        <Badge variant={isLow ? "error" : "success"}>
                          {isLow ? "Sắp hết" : "Còn hàng"}
                        </Badge>
                      </TableTd>
                      <TableTd>{formatDate(item.updatedAt)}</TableTd>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">Tổng: {total} mục</div>
    </div>
  );
}
