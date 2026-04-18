'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users, FileText, UserPlus, Clock, DollarSign, Package,
  ShoppingCart, BarChart2, Boxes, Truck, ClipboardList, Home, Tag, Monitor, PieChart, LogOut, Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { MANAGER_ROLES, FINANCE_ROLES, HR_ROLES, ALL_ROLES } from '@/lib/permissions';

const hrNav = [
  { label: 'Nhân viên',  href: '/hr/employees',         icon: Users,      roles: MANAGER_ROLES },
  { label: 'Hợp đồng',  href: '/hr/contracts',          icon: FileText,   roles: FINANCE_ROLES },
  { label: 'Tuyển dụng', href: '/hr/recruitment',       icon: UserPlus,   roles: HR_ROLES },
  { label: 'Chấm công',  href: '/hr/attendance',        icon: Clock,      roles: [...MANAGER_ROLES, 'hr', 'employee'] },
  { label: 'Kiosk',      href: '/hr/attendance/kiosk',  icon: Monitor,    roles: ALL_ROLES },
  { label: 'Lương',      href: '/hr/payroll',           icon: DollarSign, roles: FINANCE_ROLES },
  { label: 'Phiếu lương', href: '/hr/payroll/my',      icon: DollarSign, roles: ['employee', 'hr'] },
  { label: 'Tài sản',    href: '/hr/assets',            icon: Package,    roles: MANAGER_ROLES },
  { label: 'Quyết toán', href: '/hr/offboarding',      icon: LogOut,     roles: FINANCE_ROLES },
  { label: 'Báo cáo',   href: '/hr/reports',           icon: PieChart,   roles: ['director'] },
];

const salesNav = [
  { label: 'Bán tại quầy',  href: '/sales/pos',        icon: Store,        roles: [...MANAGER_ROLES, 'employee'] },
  { label: 'Đơn hàng',      href: '/sales/orders',     icon: ShoppingCart, roles: [...MANAGER_ROLES, 'employee'] },
  { label: 'Khách hàng',    href: '/sales/customers',  icon: Users,        roles: MANAGER_ROLES },
  { label: 'Sản phẩm',      href: '/sales/products',   icon: Boxes,        roles: MANAGER_ROLES },
  { label: 'Danh mục',      href: '/sales/categories', icon: Tag,          roles: ['director', 'ADMIN'] },
  { label: 'Kho hàng',      href: '/sales/inventory',  icon: ClipboardList,roles: MANAGER_ROLES },
  { label: 'Nhà cung cấp',  href: '/sales/suppliers',  icon: Truck,        roles: MANAGER_ROLES },
  { label: 'Báo cáo',       href: '/sales/reports',    icon: BarChart2,    roles: FINANCE_ROLES },
];

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/hr' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer',
        active
          ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      )}
    >
      <Icon size={16} className={active ? 'text-indigo-400' : ''} />
      {label}
    </Link>
  );
}

function NavSection({ title, items }: { title: string; items: typeof hrNav }) {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const visible = items.filter((item) => item.roles.includes(role));
  if (visible.length === 0) return null;
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <div className="space-y-0.5">
        {visible.map((item) => <NavItem key={item.href} {...item} />)}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5 border-b border-white/5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 shadow-md shadow-indigo-500/40">
          <span className="text-xs font-bold text-white">F</span>
        </div>
        <span className="text-sm font-bold text-white tracking-wide">FORHER</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <NavSection title="Nhân sự" items={hrNav} />
        <NavSection title="Bán hàng" items={salesNav} />
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-3">
        <p className="text-[10px] text-slate-600">v1.0.0 · FORHER</p>
      </div>
    </aside>
  );
}
