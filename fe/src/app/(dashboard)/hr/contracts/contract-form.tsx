'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { addMonths, addYears, format } from 'date-fns';
import { useEffect } from 'react';
import { createContract, updateContract, submitContract } from '@/services/contract.service';
import { getEmployees } from '@/services/employee.service';
import { Button, Input, Select } from '@/components/ui';
import type { Contract } from '@/types';

const DURATION_OPTIONS = [
  { value: '6m', label: '6 tháng' },
  { value: '1y', label: '1 năm' },
  { value: '2y', label: '2 năm' },
  { value: '3y', label: '3 năm' },
];

function calcEndDate(from: Date, duration: string): string | undefined {
  if (duration === 'none') return undefined;
  if (duration === '6m')   return format(addMonths(from, 6), 'yyyy-MM-dd');
  if (duration === '1y')   return format(addYears(from, 1), 'yyyy-MM-dd');
  if (duration === '2y')   return format(addYears(from, 2), 'yyyy-MM-dd');
  if (duration === '3y')   return format(addYears(from, 3), 'yyyy-MM-dd');
  return undefined;
}

const schema = z.object({
  employeeId:   z.string().min(1, 'Vui lòng chọn nhân viên'),
  duration:     z.string().min(1, 'Vui lòng chọn thời hạn'),
  baseSalary:   z.coerce.number({ invalid_type_error: 'Nhập số hợp lệ' }).min(1, 'Lương phải lớn hơn 0'),
  allowance:    z.coerce.number().min(0).optional().default(0),
  position:     z.string().optional(),
  workingHours: z.string().optional(),
  leavePolicy:  z.string().optional(),
  otherTerms:   z.string().optional(),
});

const activeEditSchema = z.object({
  allowance: z.coerce.number().min(0).optional().default(0),
  position:  z.string().optional(),
  duration:  z.string().optional(),
});

type FormData      = z.infer<typeof schema>;
type ActiveData    = z.infer<typeof activeEditSchema>;

interface Props {
  branchId?: string;
  editContract?: Contract;
  onSuccess: () => void;
}

export function ContractForm({ branchId, editContract, onSuccess }: Props) {
  const isEdit   = !!editContract;
  const isActive = editContract?.status === 'ACTIVE';

  // Form sửa ACTIVE
  const activeForm = useForm<ActiveData>({
    resolver: zodResolver(activeEditSchema),
    defaultValues: { allowance: editContract?.allowance ?? 0, position: editContract?.position ?? '', duration: '' },
  });

  // Form tạo / sửa DRAFT
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? {
      baseSalary:   editContract.baseSalary,
      allowance:    editContract.allowance ?? 0,
      position:     editContract.position ?? '',
      workingHours: editContract.workingHours ?? '',
      leavePolicy:  editContract.leavePolicy ?? '',
      otherTerms:   editContract.otherTerms ?? '',
    } : { allowance: 0 },
  });

  const { data: empData, isLoading: loadingEmp } = useQuery({
    queryKey: ['employees', { branchId, pageSize: 200 }],
    queryFn: () => getEmployees({ branchId, pageSize: 200 }),
    enabled: !isEdit,
  });

  const employees = empData?.data ?? [];
  const employeeOptions = employees.map((e) => ({
    value: e.employeeId,
    label: `${e.fullName} (${e.employeeId})`,
  }));

  // Tự điền vị trí khi chọn nhân viên
  const selectedEmployeeId = useWatch({ control, name: 'employeeId' });
  useEffect(() => {
    if (!isEdit && selectedEmployeeId) {
      const emp = employees.find((e) => e.employeeId === selectedEmployeeId);
      if (emp?.position) setValue('position', emp.position);
    }
  }, [selectedEmployeeId]);

  async function onSubmitActive(data: ActiveData) {
    try {
      const today = new Date();
      // Gia hạn từ ngày kết thúc hiện tại (nếu còn hiệu lực) hoặc từ hôm nay
      const base = editContract?.endDate && new Date(editContract.endDate) > today
        ? new Date(editContract.endDate)
        : today;
      const newEndDate = data.duration ? calcEndDate(base, data.duration) : undefined;

      await updateContract(editContract!.contractId, {
        allowance: data.allowance ?? 0,
        position:  data.position || undefined,
        endDate:   newEndDate,
      });
      await submitContract(editContract!.contractId);
      onSuccess();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.response?.data ?? err?.message));
    }
  }

  async function onSubmit(data: FormData) {
    try {
      const today    = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      const endDate   = calcEndDate(today, data.duration);

      const payload = {
        contractType: 'Hợp đồng lao động',
        startDate,
        endDate,
        baseSalary:   data.baseSalary,
        allowance:    data.allowance ?? 0,
        position:     data.position || undefined,
        workingHours: data.workingHours || undefined,
        leavePolicy:  data.leavePolicy || undefined,
        otherTerms:   data.otherTerms || undefined,
      };

      if (isEdit) {
        await updateContract(editContract.contractId, payload);
      } else {
        await createContract({ ...payload, employeeId: data.employeeId });
      }
      onSuccess();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.response?.data ?? err?.message));
    }
  }

  // Sửa hợp đồng ACTIVE
  if (isActive) {
    return (
      <form onSubmit={activeForm.handleSubmit(onSubmitActive)} className="space-y-4">
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs text-amber-700">
          Hợp đồng đang hiệu lực — chỉ có thể chỉnh sửa phụ cấp, vị trí và gia hạn.
        </div>
        <Input label="Vị trí / Chức danh trong hợp đồng"
          placeholder={editContract.position || 'Nhập vị trí...'}
          {...activeForm.register('position')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phụ cấp (VNĐ)" type="number" step="1000" min="0"
            {...activeForm.register('allowance')} />
          <Select label="Gia hạn thêm"
            options={DURATION_OPTIONS}
            placeholder="Không gia hạn"
            {...activeForm.register('duration')} />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={activeForm.formState.isSubmitting}>Lưu & Gửi duyệt</Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEdit && (
        <Select
          label="Nhân viên"
          options={employeeOptions}
          placeholder={loadingEmp ? 'Đang tải...' : 'Chọn nhân viên'}
          error={errors.employeeId?.message}
          {...register('employeeId')}
        />
      )}

      <Select label="Thời hạn hợp đồng"
        options={DURATION_OPTIONS}
        placeholder="Chọn thời hạn"
        error={errors.duration?.message}
        {...register('duration')} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Mức lương (VNĐ)" type="number" step="1000" min="0"
          error={errors.baseSalary?.message}
          {...register('baseSalary')} />
        <Input label="Phụ cấp (VNĐ)" type="number" step="1000" min="0"
          {...register('allowance')} />
      </div>

      <Input label="Quy định giờ làm việc" placeholder="VD: 8h/ngày, thứ 2 - thứ 6" {...register('workingHours')} />
      <Input label="Quy định nghỉ phép" placeholder="VD: 12 ngày/năm" {...register('leavePolicy')} />

      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">Các thỏa thuận khác</p>
        <textarea
          {...register('otherTerms')}
          rows={3}
          placeholder="Các điều khoản bổ sung..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? 'Lưu thay đổi' : 'Tạo hợp đồng'}
        </Button>
      </div>
    </form>
  );
}
