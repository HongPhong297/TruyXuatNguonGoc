'use server'

/**
 * Account provisioning — sau khi user signup, tạo node Neo4j tương ứng role
 * Convention: entity.id === user.id (1-1 binding)
 *
 * Gọi từ 2 nơi:
 * 1. Client login/signup page sau signUp.email() thành công (qua Server Action)
 * 2. `getCurrentEntity()` helper — idempotent MERGE nếu user chưa có entity
 */
import { runQuery } from '@/lib/neo4j'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export type EntityRole = 'farmer' | 'facility' | 'distributor'

interface LinkParams {
  userId: string
  role: EntityRole
  name: string
  email: string
}

/**
 * MERGE node theo role, gắn id = user.id
 * Idempotent: gọi nhiều lần không tạo trùng
 */
async function mergeEntity({ userId, role, name, email }: LinkParams) {
  const label = role === 'farmer' ? 'Farmer' : role === 'facility' ? 'Facility' : 'Distributor'

  await runQuery(
    `
    MERGE (e:${label} {id: $userId})
    ON CREATE SET
      e.user_id = $userId,
      e.name = $name,
      e.email = $email,
      e.created_at = datetime()
    ON MATCH SET
      e.updated_at = datetime()
    RETURN e
    `,
    { userId, name, email },
    'WRITE',
  )
}

/**
 * Server Action — gọi từ login/signup page sau signup thành công
 */
export async function linkUserToEntityAction(role: EntityRole) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false, error: 'Chưa đăng nhập' }

  const user = session.user
  if (role !== 'farmer' && role !== 'facility' && role !== 'distributor') {
    return { ok: false, error: 'Role không hợp lệ' }
  }

  await mergeEntity({
    userId: user.id,
    role,
    name: user.name ?? user.email,
    email: user.email,
  })

  return { ok: true, entityId: user.id }
}

/**
 * Bootstrap — đảm bảo user hiện tại có entity trong Neo4j
 * Gọi từ Server Components khi render page — idempotent
 */
export async function ensureEntityForCurrentUser(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const user = session.user
  const role = (user as Record<string, unknown>).role as string | undefined
  if (role !== 'farmer' && role !== 'facility' && role !== 'distributor') {
    return null // admin/auditor không cần entity
  }

  await mergeEntity({
    userId: user.id,
    role: role as EntityRole,
    name: user.name ?? user.email,
    email: user.email,
  })

  return user.id
}
