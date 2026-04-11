'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { logout } from '@/services/auth.service';
import { Avatar } from '@/components/ui';

export function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      {user && (
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} size="sm" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.branchName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </header>
  );
}
