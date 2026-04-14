"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSalesReports } from "@/services/sales.service";
import type { PeriodType } from "@/types";
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
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";

const BRANCH_OPTIONS = [
  { value: "", label: "Tất cả chi nhánh" },
  { value: "CN01", label: "Chi nhánh 1" },
  { value: "CN02", label: "Chi nhánh 2" },
  { value: "CN03", label: "Chi nhánh 3" },
];

const PERIOD_LABELS: Record<PeriodType, string> = {
  daily: "Theo ngày",
  weekly: "Theo tuần",
  monthly: "Theo tháng",
  yearly: "Theo năm",
};

export default function ReportsPage() {
  const [branchId, setBranchId] = useState("");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["sales-reports", branchId],
    queryFn: () => getSalesReports(branchId || undefined),
  });

  const totalRevenue = reports?.reduce((sum, r) => sum + r.totalRevenue, 0) ?? 0;
  const totalOrders = reports?.reduce((sum, r) => sum + r.totalOrders, 0) ?? 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Báo cáo doanh thu</h1>
      </div>

      <div className="flex gap-3">
        <Select
          options={BRANCH_OPTIONS}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết báo cáo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Chi nhánh</TableTh>
                <TableTh>Kỳ báo cáo</TableTh>
                <TableTh>Từ ngày</TableTh>
                <TableTh>Đến ngày</TableTh>
                <TableTh>Doanh thu</TableTh>
                <TableTh>Số đơn</TableTh>
                <TableTh>Tạo lúc</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableTd colSpan={7} className="text-center py-8 text-gray-500">
                    Đang tải...
                  </TableTd>
                </TableRow>
              ) : !reports?.length ? (
                <TableRow>
                  <TableTd colSpan={7} className="text-center py-8 text-gray-500">
                    Chưa có báo cáo
                  </TableTd>
                </TableRow>
              ) : (
                reports.map((r) => (
                  <TableRow key={r.reportId}>
                    <TableTd>{r.branchName}</TableTd>
                    <TableTd>{PERIOD_LABELS[r.periodType]}</TableTd>
                    <TableTd>{formatDate(r.fromDate)}</TableTd>
                    <TableTd>{formatDate(r.toDate)}</TableTd>
                    <TableTd className="font-medium text-blue-600">
                      {formatCurrency(r.totalRevenue)}
                    </TableTd>
                    <TableTd>{r.totalOrders}</TableTd>
                    <TableTd>{formatDate(r.generatedAt)}</TableTd>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
