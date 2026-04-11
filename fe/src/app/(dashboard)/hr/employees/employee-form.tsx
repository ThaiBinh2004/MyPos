'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createEmployee } from '@/services/employee.service';
import { Button, Input, Select } from '@/components/ui';
import type { Branch } from '@/types';

const schema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  dateOfBirth: z.string().min(1, 'Vui lòng nhập ngày sinh'),
  idCard: z.string().min(9, 'CCCD không hợp lệ'),
  phoneNumber: z.string().min(9, 'Số điện thoại không hợp lệ'),
  bankAccount: z.string().optional(),
  position: z.string().min(1, 'Vui lòng nhập chức vụ'),
  branchId: z.string().min(1, 'Vui lòng chọn chi nhánh'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  branches: Branch[];
  onSuccess: () => void;
}

export function EmployeeForm({ branches, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await createEmployee(data);
    onSuccess();
  }

  const branchOptions = branches.map((b) => ({ value: b.branchId, label: b.branchName }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Họ tên" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Ngày sinh" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
        <Input label="CCCD" error={errors.idCard?.message} {...register('idCard')} />
        <Input label="Số điện thoại" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
        <Input label="Số tài khoản" error={errors.bankAccount?.message} {...register('bankAccount')} />
        <Input label="Chức vụ" error={errors.position?.message} {...register('position')} />
        <Select
          label="Chi nhánh"
          options={branchOptions}
          placeholder="Chọn chi nhánh"
          error={errors.branchId?.message}
          {...register('branchId')}
          className="col-span-2"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>Lưu</Button>
      </div>
    </form>
  );
}
