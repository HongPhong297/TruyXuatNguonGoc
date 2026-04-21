/**
 * Server helpers — lấy session và kiểm tra role trong Server Components / Server Actions
 */
import { auth, type UserRole } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/** Lấy session hiện tại từ request headers */
export async function getServerSession() {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  return session
}

/** Lấy user hiện tại — null nếu chưa đăng nhập */
export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user ?? null
}

/**
 * Require đăng nhập — redirect về /login nếu chưa auth
 * Dùng ở đầu Server Component hoặc Server Action
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Require role cụ thể — redirect về /unauthorized nếu sai role
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  const userRole = (user as Record<string, unknown>).role as string
  if (userRole !== role && userRole !== 'admin') {
    redirect('/unauthorized')
  }
  return user
}
