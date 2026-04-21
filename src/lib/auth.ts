/**
 * Better Auth — server-side config
 * Dùng Supabase Postgres làm database adapter
 * 4 roles: farmer | facility | distributor | admin
 */
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

// Postgres pool kết nối Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
})

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Bật khi có email provider
  },
  // Custom user fields — thêm role vào bảng user
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'farmer',
        required: false,
      },
    },
  },
  // Tên session cookie
  advanced: {
    cookiePrefix: 'agrichain',
  },
  // Trusted origins — cho phép frontend gọi auth
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ],
})

export type Auth = typeof auth

/** Type-safe user roles */
export type UserRole = 'farmer' | 'facility' | 'distributor' | 'admin'

/** Các route được phép theo role */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  farmer: ['/farmer'],
  facility: ['/facility'],
  distributor: ['/distributor'],
  admin: ['/farmer', '/facility', '/distributor', '/dashboard'],
}

/** Các route cần đăng nhập (bất kỳ role nào) */
export const PROTECTED_ROUTES = ['/farmer', '/facility', '/distributor', '/dashboard']
