"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSalesDashboard } from "@/services/sales.service";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Download, TrendingUp, ShoppingCart, BarChart2, Globe, Store } from "lucide-react";

const BRANCH_OPTIONS = [
  { value: "", label: "Tất cả chi nhánh" },
  { value: "BR001", label: "Chi nhánh Quận 1" },
  { value: "BR002", label: "Chi nhánh Quận 3" },
  { value: "BR003", label: "Chi nhánh Bình Thạnh" },
];

const RANGE_OPTIONS = [
  { value: "7", label: "7 ngày qua" },
  { value: "30", label: "30 ngày qua" },
  { value: "90", label: "90 ngày qua" },
  { value: "custom", label: "Tuỳ chỉnh" },
];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function subtractDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateStr(d);
}

const fmt = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });

export default function ReportsPage() {
  const [branchId, setBranchId] = useState("");
  const [range, setRange] = useState("30");
  const [dateFrom, setDateFrom] = useState(subtractDays(30));
  const [dateTo, setDateTo] = useState(toDateStr(new Date()));

  const effectiveDateFrom = range !== "custom" ? subtractDays(Number(range)) : dateFrom;
  const effectiveDateTo = range !== "custom" ? toDateStr(new Date()) : dateTo;

  const { data, isLoading } = useQuery({
    queryKey: ["sales-dashboard", branchId, effectiveDateFrom, effectiveDateTo],
    queryFn: () =>
      getSalesDashboard({
        branchId: branchId || undefined,
        dateFrom: effectiveDateFrom,
        dateTo: effectiveDateTo,
      }),
  });

  function handleExport() {
    if (!data) return;
    const rows = [
      ["Báo cáo doanh thu FORHER"],
      ["Từ ngày", effectiveDateFrom, "Đến ngày", effectiveDateTo],
      [],
      ["Tổng doanh thu", data.totalRevenue],
      ["Tổng đơn hàng", data.totalOrders],
      ["Giá trị trung bình/đơn", data.avgOrderValue],
      ["Đơn online", data.onlineOrders],
      ["Đơn tại quầy", data.offlineOrders],
      [],
      ["Doanh thu theo chi nhánh"],
      ["Chi nhánh", "Doanh thu"],
      ...(data.revenueByBranch ?? []).map((b) => [b.name, b.revenue]),
      [],
      ["Doanh thu theo ngày"],
      ["Ngày", "Doanh thu"],
      ...(data.revenueByDate ?? []).map((d) => [d.date, d.revenue]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-cao-doanh-thu-${effectiveDateFrom}-${effectiveDateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const branchData = data?.revenueByBranch ?? [];
  const dateData = data?.revenueByDate ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Báo cáo doanh thu</h1>
        <Button onClick={handleExport} disabled={!data} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          options={BRANCH_OPTIONS}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        />
        <Select
          options={RANGE_OPTIONS}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        />
        {range === "custom" && (
          <>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">Đang tải...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tổng doanh thu</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(data?.totalRevenue ?? 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tổng đơn hàng</p>
                    <p className="text-lg font-bold text-green-600">{data?.totalOrders ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BarChart2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trung bình/đơn</p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatCurrency(data?.avgOrderValue ?? 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Globe className="w-3 h-3" /> Online
                      </span>
                      <span className="font-medium">{data?.onlineOrders ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Store className="w-3 h-3" /> Tại quầy
                      </span>
                      <span className="font-medium">{data?.offlineOrders ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1 pt-1 border-t border-gray-100">
                      <span className="text-gray-500">Online rev</span>
                      <span className="font-medium text-blue-600 text-[11px]">
                        {formatCurrency(data?.onlineRevenue ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Tại quầy rev</span>
                      <span className="font-medium text-orange-600 text-[11px]">
                        {formatCurrency(data?.offlineRevenue ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doanh thu theo chi nhánh</CardTitle>
              </CardHeader>
              <CardContent>
                {branchData.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">Không có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={branchData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => fmt.format(v)} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [formatCurrency(v), "Doanh thu"]}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Xu hướng doanh thu theo ngày</CardTitle>
              </CardHeader>
              <CardContent>
                {dateData.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">Không có dữ liệu</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={dateData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => fmt.format(v)} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [formatCurrency(v), "Doanh thu"]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Doanh thu"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
