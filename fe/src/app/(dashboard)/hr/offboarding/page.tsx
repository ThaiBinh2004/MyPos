'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingSettlement, settleOffboarding } from '@/services/offboarding.service';
import { Modal, Input } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import type { Offboarding } from '@/types';
import { CheckCircle, AlertCircle, Package, Wallet, CreditCard, MinusCircle } from 'lucide-react';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:           { label: 'Chờ',      color: 'bg-gray-100 text-gray-500' },
  RETURNED_GOOD:     { label: 'Tốt',      color: 'bg-green-100 text-green-700' },
  RETURNED_DAMAGED:  { label: 'Hư hỏng',  color: 'bg-orange-100 text-orange-700' },
  MISSING:           { label: 'Mất',      color: 'bg-red-100 text-red-700' },
};

const SETTLEMENT_METHODS = [
  { value: 'SALARY_DEDUCTION', label: 'Trừ lương',            icon: MinusCircle,  color: 'text-orange-600 border-orange-200 bg-orange-50' },
  { value: 'DIRECT_PAYMENT',   label: 'Thanh toán trực tiếp', icon: CreditCard,   color: 'text-blue-600 border-blue-200 bg-blue-50' },
  { value: 'NONE',             label: 'Không có bồi thường',  icon: Wallet,       color: 'text-gray-500 border-gray-200 bg-gray-50' },
];

export default function OffboardingSettlementPage() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [settling, setSettling] = useState<Offboarding | null>(null);
  const [settlementMethod, setSettlementMethod] = useState('');
  const [settlementNote, setSettlementNote] = useState('');

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['pending-settlement'],
    queryFn: getPendingSettlement,
  });

  const settleMut = useMutation({
    mutationFn: () => settleOffboarding(
      settling!.offboardingId,
      user?.employeeId ?? '',
      settlementMethod,
      settlementNote,
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-settlement'] });
      setSettling(null);
      setSettlementMethod('');
      setSettlementNote('');
    },
  });

  const totalCompensation = (ob: Offboarding) =>
    ob.assetReturns.reduce((s, r) => s + (r.compensationAmount ?? 0), 0);

  function openSettle(ob: Offboarding) {
    const comp = totalCompensation(ob);
    setSettling(ob);
    setSettlementMethod(comp > 0 ? '' : 'NONE');
    setSettlementNote('');
  }

  const settlingComp = settling ? totalCompensation(settling) : 0;
  const canSubmit = !!settlementMethod && (settlingComp === 0 || !!settlementNote.trim()) && !settleMut.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Quyết toán nghỉ việc</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hồ sơ đã được giám đốc phê duyệt, chờ kế toán quyết toán.</p>
      </div>

      {isLoading && <p className="text-sm text-gray-400 text-center py-10">Đang tải...</p>}

      {!isLoading && list.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không có hồ sơ nào chờ quyết toán.</p>
        </div>
      )}

      {list.map((ob) => {
        const comp = totalCompensation(ob);
        const damaged = ob.assetReturns.filter((r) => r.returnStatus === 'RETURNED_DAMAGED' || r.returnStatus === 'MISSING');
        return (
          <div key={ob.offboardingId} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">{ob.employeeName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ob.employeePosition} · {ob.employeeBranchName} · Nghỉ {formatDate(ob.lastWorkingDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {comp > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5">
                    <AlertCircle size={13} className="text-red-500" />
                    <span className="text-xs font-medium text-red-600">Bồi thường: {formatCurrency(comp)}</span>
                  </div>
                )}
                <button
                  onClick={() => openSettle(ob)}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors">
                  Quyết toán
                </button>
              </div>
            </div>

            {/* Reason */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs text-gray-500">Lý do nghỉ: </span>
              <span className="text-xs text-gray-700">{ob.reason}</span>
            </div>

            {/* Asset returns */}
            {ob.assetReturns.length > 0 && (
              <div className="px-5 py-3">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                  <Package size={12} /> Tài sản bàn giao
                </p>
                <div className="space-y-1.5">
                  {ob.assetReturns.map((r) => (
                    <div key={r.returnId} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{r.assetName}</span>
                      <div className="flex items-center gap-3">
                        {r.notes && <span className="text-gray-400 italic">{r.notes}</span>}
                        {r.compensationAmount > 0 && (
                          <span className="text-red-600 font-medium">Bồi thường {formatCurrency(r.compensationAmount)}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_LABEL[r.returnStatus]?.color ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[r.returnStatus]?.label ?? r.returnStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ob.directorNote && (
              <div className="px-5 pb-3 text-xs text-gray-500 border-t border-gray-50 pt-2">
                <span className="font-medium">Ghi chú GĐ: </span>{ob.directorNote}
              </div>
            )}
          </div>
        );
      })}

      {/* Settle modal */}
      {settling && (
        <Modal open onClose={() => setSettling(null)} title="Xác nhận quyết toán" size="sm">
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nhân viên</span>
                <span className="font-medium">{settling.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày nghỉ</span>
                <span className="font-medium">{formatDate(settling.lastWorkingDate)}</span>
              </div>
              {settlingComp > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng bồi thường</span>
                  <span className="font-semibold text-red-600">{formatCurrency(settlingComp)}</span>
                </div>
              )}
            </div>

            {/* Compensation method — chỉ hiện khi có bồi thường */}
            {settlingComp > 0 ? (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Phương thức xử lý bồi thường <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-2 gap-2">
                  {SETTLEMENT_METHODS.filter((m) => m.value !== 'NONE').map((m) => {
                    const Icon = m.icon;
                    const active = settlementMethod === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setSettlementMethod(m.value)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                          active ? m.color + ' ring-1 ring-current' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}>
                        <Icon size={13} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <Input
              label={settlingComp > 0 ? 'Ghi chú xử lý bồi thường' : 'Ghi chú quyết toán (tuỳ chọn)'}
              value={settlementNote}
              onChange={(e) => setSettlementNote(e.target.value)}
              placeholder={settlingComp > 0 ? 'VD: Trừ vào lương tháng 05/2026...' : 'VD: Tất cả tài sản nguyên vẹn...'}
            />

            {settleMut.isError && (
              <p className="text-xs text-red-500">{String((settleMut.error as any)?.response?.data ?? 'Có lỗi xảy ra')}</p>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setSettling(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                Huỷ
              </button>
              <button
                onClick={() => settleMut.mutate()}
                disabled={!canSubmit}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {settleMut.isPending ? 'Đang xử lý...' : 'Xác nhận quyết toán'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
