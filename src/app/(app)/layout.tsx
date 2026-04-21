import AppSidebar from '@/components/layout/app-sidebar'
import { requireAuth } from '@/lib/auth-helpers'

/** Layout bảo vệ toàn bộ (app) group — redirect /login nếu chưa đăng nhập */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Server-side session check — redirect nếu không có session hợp lệ
  await requireAuth()

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
