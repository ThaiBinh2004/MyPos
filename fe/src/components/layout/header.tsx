'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/services/auth.service';
import { getEmployee, getBranches } from '@/services/employee.service';
import { getEmployeeContracts } from '@/services/contract.service';
import { EmployeeDetail } from '@/app/(dashboard)/hr/employees/employee-detail';

export function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [openProfile, setOpenProfile] = useState(false);

  const { data: myProfile } = useQuery({
    queryKey: ['employee', user?.employeeId],
    queryFn: () => getEmployee(user!.employeeId!),
    enabled: !!user?.employeeId && openProfile,
  });

  const { data: myContracts = [] } = useQuery({
    queryKey: ['employee-contracts', user?.employeeId],
    queryFn: () => getEmployeeContracts(user!.employeeId!),
    enabled: !!user?.employeeId && user?.role === 'employee',
    staleTime: 5 * 60 * 1000,
  });

  const hasUnsigned = myContracts.some((c) => c.status === 'ACTIVE' && !c.signedByEmployee);

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
    enabled: openProfile,
  });

  async function handleLogout() {
    await logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }

  function getInitials(name: string | null) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const roleLabel: Record<string, string> = {
    director: 'Giám đốc',
    branch_manager: 'Quản lý chi nhánh',
    accountant: 'Kế toán',
    employee: 'Nhân viên',
    ADMIN: 'Quản trị viên',
    hr: 'HR',
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6 shadow-sm">
        <div />
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {user.fullName ?? user.role}
              </p>
              <p className="text-xs text-gray-400">
                {roleLabel[user.role] ?? user.role}
                {user.branchName ? ` · ${user.branchName}` : ''}
              </p>
            </div>
            <button
              onClick={() => user.employeeId && setOpenProfile(true)}
              title={hasUnsigned ? 'Bạn có hợp đồng chờ ký xác nhận' : 'Xem hồ sơ'}
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              {getInitials(user.fullName)}
              {hasUnsigned && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </header>

      {openProfile && myProfile && (
        <EmployeeDetail
          employee={myProfile}
          role={user?.role ?? ''}
          currentEmployeeId={user?.employeeId ?? undefined}
          currentEmployeeName={user?.fullName ?? undefined}
          branches={branches}
          defaultOpenContracts={hasUnsigned}
          onClose={() => setOpenProfile(false)}
        />
      )}
    </>
  );
}
