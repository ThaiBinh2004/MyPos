'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createContract } from '@/services/contract.service';
import { Button, Input, Select } from '@/components/ui';

const schema = z.object({
  employeeId: z.string().min(1, 'Vui lòng nhập mã nhân viên'),
  contractType: z.string().min(1, 'Vui lòng chọn loại hợp đồng'),
  startDate: z.string().min(1, 'Vui lòng nhập ngày bắt đầu'),
  endDate: z.string().optional(),
  baseSalary: z.coerce.number().min(0),
  allowance: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess: () => void;
}

const contractTypeOptions = [
  { value: 'probation', label: 'Thử việc' },
  { value: 'definite', label: 'Xác định thời hạn' },
  { value: 'indefinite', label: 'Không xác định thời hạn' },
];

export function ContractForm({ onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await createContract(data);
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Mã nhân viên" error={errors.employeeId?.message} {...register('employeeId')} />
      <Select
        label="Loại hợp đồng"
        options={contractTypeOptions}
        placeholder="Chọn loại"
        error={errors.contractType?.message}
        {...register('contractType')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ngày bắt đầu" type="date" error={errors.startDate?.message} {...register('startDate')} />
        <Input label="Ngày kết thúc" type="date" {...register('endDate')} />
        <Input label="Lương cơ bản" type="number" error={errors.baseSalary?.message} {...register('baseSalary')} />
        <Input label="Phụ cấp" type="number" error={errors.allowance?.message} {...register('allowance')} />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>Lưu</Button>
      </div>
    </form>
  );
}
