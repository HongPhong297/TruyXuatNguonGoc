/**
 * Better Auth catch-all API handler
 * Xử lý tất cả /api/auth/* requests (signIn, signOut, session, callback...)
 */
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
