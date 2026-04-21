/**
 * Sidebar cho khu vực đăng nhập (app)
 * Hiển thị menu theo role của user
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { vi } from '@/lib/i18n/vi';
import {
  LayoutDashboard,
  Sprout,
  Factory,
  Truck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/notifications/notification-bell';

const navItems = [
  { href: '/dashboard', label: vi.nav.dashboard, icon: LayoutDashboard },
  { href: '/farmer', label: vi.roles.farmer, icon: Sprout },
  { href: '/facility', label: vi.roles.facility, icon: Factory },
  { href: '/distributor', label: vi.roles.distributor, icon: Truck },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-700">
          <span className="text-xl">🌿</span>
          <span className="text-sm">{vi.app.shortName}</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Đăng xuất */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {vi.nav.logout}
        </Link>
      </div>
    </aside>
  );
}
