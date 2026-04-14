'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { getEmployees, getBranches, deactivateEmployee } from '@/services/employee.service';
import {
  Button, Input, Select, Badge, Table, TableHead, TableBody,
  TableRow, TableTh, TableTd, Avatar, Modal, PageSpinner,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { EmployeeFilters } from '@/types';
import { EmployeeForm } from './employee-form';

const statusLabel: Record<string, { label: string; variant: 'success' | 'danger' | 'default' }> = {
  active: { label: 'Đang làm', variant: 'success' },
  inactive: { label: 'Tạm nghỉ', variant: 'default' },
  terminated: { label: 'Đã nghỉ', variant: 'danger' },
};

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', filters],
    queryFn: () => getEmployees(filters),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  function handleSearch() {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }

  const branchOptions = branches.map((b) => ({ value: b.branchId, label: b.branchName }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Nhân viên</h1>
        <Button onClick={() => setOpenForm(true)}>
          <Plus size={16} /> Thêm nhân viên
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Tìm theo tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-xs"
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search size={16} />
          </Button>
        </div>
        <Select
          options={branchOptions}
          placeholder="Tất cả chi nhánh"
          onChange={(e) => setFilters((f) => ({ ...f, branchId: e.target.value || undefined, page: 1 }))}
          className="w-48"
        />
        <Select
          options={[
            { value: 'active', label: 'Đang làm' },
            { value: 'inactive', label: 'Tạm nghỉ' },
            { value: 'terminated', label: 'Đã nghỉ' },
          ]}
          placeholder="Tất cả trạng thái"
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as never || undefined, page: 1 }))}
          className="w-44"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>Nhân viên</TableTh>
              <TableTh>Chức vụ</TableTh>
              <TableTh>Chi nhánh</TableTh>
              <TableTh>Ngày sinh</TableTh>
              <TableTh>Số điện thoại</TableTh>
              <TableTh>Trạng thái</TableTh>
              <TableTh />
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((emp) => {
              const status = statusLabel[emp.status?.toLowerCase()] ?? { label: emp.status, variant: 'default' as const };
              return (
                <TableRow key={emp.employeeId}>
                  <TableTd>
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.fullName} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{emp.fullName}</p>
                        <p className="text-xs text-gray-500">{emp.employeeId}</p>
                      </div>
                    </div>
                  </TableTd>
                  <TableTd>{emp.position}</TableTd>
                  <TableTd>{emp.branchName}</TableTd>
                  <TableTd>{formatDate(emp.dateOfBirth)}</TableTd>
                  <TableTd>{emp.phoneNumber}</TableTd>
                  <TableTd>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableTd>
                  <TableTd>
                    {emp.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivate.mutate(emp.employeeId)}
                      >
                        Tạm nghỉ
                      </Button>
                    )}
                  </TableTd>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Thêm nhân viên" size="lg">
        <EmployeeForm
          branches={branches}
          onSuccess={() => {
            setOpenForm(false);
            qc.invalidateQueries({ queryKey: ['employees'] });
          }}
        />
      </Modal>
    </div>
  );
}
