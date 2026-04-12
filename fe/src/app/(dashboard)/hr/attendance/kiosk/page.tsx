"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { checkin, checkout } from "@/services/attendance.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";

type Mode = "select" | "checkin" | "checkout" | "success";

export default function KioskPage() {
  const [mode, setMode] = useState<Mode>("select");
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [resultName, setResultName] = useState("");
  const [resultTime, setResultTime] = useState("");
  const [error, setError] = useState("");

  const checkinMutation = useMutation({
    mutationFn: () => checkin({ employeeId, pin }),
    onSuccess: (data) => {
      setResultName(data.employeeName);
      setResultTime(formatDateTime(data.checkInTime ?? new Date().toISOString()));
      setMode("success");
      scheduleReset();
    },
    onError: () => setError("Mã nhân viên hoặc PIN không đúng"),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => checkout({ employeeId, pin }),
    onSuccess: (data) => {
      setResultName(data.employeeName);
      setResultTime(formatDateTime(data.checkOutTime ?? new Date().toISOString()));
      setMode("success");
      scheduleReset();
    },
    onError: () => setError("Mã nhân viên hoặc PIN không đúng"),
  });

  function scheduleReset() {
    setTimeout(() => {
      setMode("select");
      setEmployeeId("");
      setPin("");
      setError("");
    }, 3000);
  }

  function handleSubmit() {
    setError("");
    if (!employeeId || !pin) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (mode === "checkin") checkinMutation.mutate();
    if (mode === "checkout") checkoutMutation.mutate();
  }

  function handleBack() {
    setMode("select");
    setEmployeeId("");
    setPin("");
    setError("");
  }

  const isPending = checkinMutation.isPending || checkoutMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">FORHER</h1>
          <p className="text-gray-400 mt-1">Hệ thống chấm công</p>
        </div>

        {mode === "select" && (
          <div className="space-y-4">
            <Button
              className="w-full py-6 text-lg"
              onClick={() => setMode("checkin")}
            >
              Check-in — Bắt đầu ca
            </Button>
            <Button
              className="w-full py-6 text-lg"
              variant="outline"
              onClick={() => setMode("checkout")}
            >
              Check-out — Kết thúc ca
            </Button>
          </div>
        )}

        {(mode === "checkin" || mode === "checkout") && (
          <div className="bg-white rounded-2xl p-8 space-y-5">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              {mode === "checkin" ? "Check-in" : "Check-out"}
            </h2>

            <Input
              label="Mã nhân viên"
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setError(""); }}
              placeholder="VD: NV001"
              autoFocus
            />
            <Input
              label="Mã PIN"
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(""); }}
              placeholder="Nhập PIN"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              loading={isPending}
            >
              Xác nhận
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleBack}
            >
              Quay lại
            </Button>
          </div>
        )}

        {mode === "success" && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-3">
            <div className="text-5xl">✓</div>
            <h2 className="text-2xl font-bold text-green-600">Thành công!</h2>
            <p className="text-gray-700 text-lg font-medium">{resultName}</p>
            <p className="text-gray-500">{resultTime}</p>
            <p className="text-sm text-gray-400 mt-4">Tự động đóng sau 3 giây...</p>
          </div>
        )}
      </div>
    </div>
  );
}
