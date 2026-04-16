'use client';

import { LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/services/auth.service';

export function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();

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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-200">
            {getInitials(user.fullName)}
          </div>
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
  );
}
