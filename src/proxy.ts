/**
 * Next.js Proxy — chỉ bảo vệ route public khỏi bị index khi cần
 * Route protection thực hiện trong từng Server Component qua requireAuth()
 * Lý do không dùng proxy để check session: Edge runtime không support auth.api.getSession()
 */
import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // Không redirect — để từng page tự kiểm tra session qua requireAuth()
  return NextResponse.next()
}

export const config = {
  matcher: [],  // Không match route nào — proxy là no-op
}
