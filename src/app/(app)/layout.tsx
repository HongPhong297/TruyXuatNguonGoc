import AppSidebar from '@/components/layout/app-sidebar'
import { requireAuth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'

/** Map role → trang mặc định khi vào app */
const ROLE_HOME: Record<string, string> = {
  farmer:      '/farmer',
  facility:    '/facility',
  distributor: '/distributor',
  admin:       '/dashboard',
}

/** Layout bảo vệ (app) group — redirect /login nếu chưa đăng nhập */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const role = (user as Record<string, unknown>).role as string ?? 'farmer'

  return (
    <div className="flex min-h-screen">
      <AppSidebar role={role} userName={(user as Record<string, unknown>).name as string ?? user.email} />
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
