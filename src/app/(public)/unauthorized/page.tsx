import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Không có quyền truy cập' }

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-500 text-sm mb-6">
          Tài khoản của bạn không có quyền vào trang này.
        </p>
        <Link href="/" className="text-green-700 font-medium hover:underline text-sm">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
