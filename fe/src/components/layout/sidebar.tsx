'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users, FileText, UserPlus, Clock, DollarSign, Package,
  ShoppingCart, BarChart2, Boxes, Truck, ClipboardList, Home, Tag, Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const hrNav = [
  { label: 'Dashboard', href: '/hr', icon: Home },
  { label: 'Nhân viên', href: '/hr/employees', icon: Users },
  { label: 'Hợp đồng', href: '/hr/contracts', icon: FileText },
  { label: 'Tuyển dụng', href: '/hr/recruitment', icon: UserPlus },
  { label: 'Chấm công', href: '/hr/attendance', icon: Clock },
  { label: 'Kiosk', href: '/hr/attendance/kiosk', icon: Monitor },
  { label: 'Lương', href: '/hr/payroll', icon: DollarSign },
  { label: 'Tài sản', href: '/hr/assets', icon: Package },
];

const salesNav = [
  { label: 'Đơn hàng', href: '/sales/orders', icon: ShoppingCart },
  { label: 'Sản phẩm', href: '/sales/products', icon: Boxes },
  { label: 'Danh mục', href: '/sales/categories', icon: Tag },
  { label: 'Kho hàng', href: '/sales/inventory', icon: ClipboardList },
  { label: 'Nhà cung cấp', href: '/sales/suppliers', icon: Truck },
  { label: 'Báo cáo', href: '/sales/reports', icon: BarChart2 },
];

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/hr' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-5">
        <span className="text-lg font-bold text-blue-700">FORHER</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Nhân sự
          </p>
          <div className="space-y-0.5">
            {hrNav.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </div>

        <div>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Bán hàng
          </p>
          <div className="space-y-0.5">
            {salesNav.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </div>
      </nav>
    </aside>
  );
}
