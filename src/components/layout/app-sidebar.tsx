/**
 * Sidebar lọc menu theo role user
 * Nhận role + name từ Server Component (app/layout) qua props
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
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/notifications/notification-bell';

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]  // roles được phép thấy menu này
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',   label: vi.nav.dashboard,        icon: LayoutDashboard, roles: ['admin'] },
  { href: '/farmer',      label: vi.roles.farmer,          icon: Sprout,          roles: ['farmer', 'admin'] },
  { href: '/facility',    label: vi.roles.facility,        icon: Factory,         roles: ['facility', 'admin'] },
  { href: '/distributor', label: vi.roles.distributor,     icon: Truck,           roles: ['distributor', 'admin'] },
]

interface AppSidebarProps {
  role: string
  userName: string
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  farmer:      { label: 'Nông dân',          color: 'bg-green-100 text-green-700' },
  facility:    { label: 'Cơ sở chế biến',    color: 'bg-blue-100 text-blue-700' },
  distributor: { label: 'Phân phối',          color: 'bg-amber-100 text-amber-700' },
  admin:       { label: 'Quản trị',           color: 'bg-purple-100 text-purple-700' },
}

export default function AppSidebar({ role, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role))
  const roleInfo = ROLE_LABELS[role] ?? { label: role, color: 'bg-gray-100 text-gray-600' }

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo + Bell */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-700">
          <span className="text-xl">🌿</span>
          <span className="text-sm">{vi.app.shortName}</span>
        </Link>
        <NotificationBell />
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{userName}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav — filtered by role */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {visibleItems.map(({ href, label, icon: Icon }) => {
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
          href="/api/auth/sign-out"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {vi.nav.logout}
        </Link>
      </div>
    </aside>
  );
}
