/**
 * Migration script — Phase 11
 *
 * Tạo 3 demo user (farmer/facility/distributor@demo.vn) qua Better Auth
 * → MERGE/UPDATE 3 seed entities trong Neo4j với id = user.id
 *
 * Chạy: pnpm tsx --env-file .env.local scripts/migrate-demo-to-auth.ts
 *
 * Idempotent: chạy nhiều lần không fail
 */
import { auth } from '@/lib/auth'
import { runQuery, getDriver } from '@/lib/neo4j'

interface DemoUser {
  email: string
  name: string
  role: 'farmer' | 'facility' | 'distributor'
  legacySeedId: string  // ID cũ trong seed (vd: 'farmer-cfe-001')
  label: string         // Neo4j label
}

const DEMO_USERS: DemoUser[] = [
  { email: 'farmer.demo@test.vn',      name: 'Hùng Robusta',     role: 'farmer',      legacySeedId: 'farmer-cfe-001', label: 'Farmer' },
  { email: 'facility.demo@test.vn',    name: 'HTX Cà phê Đắk Lắk', role: 'facility',  legacySeedId: 'fac-cfe-001',   label: 'Facility' },
  { email: 'distributor.demo@test.vn', name: 'Công ty TM Phú Thái', role: 'distributor', legacySeedId: 'dist-001',     label: 'Distributor' },
]

const DEMO_PASSWORD = 'demo1234'  // 8+ ký tự cho Better Auth

async function ensureUser(d: DemoUser): Promise<string> {
  // Try signup; nếu user đã tồn tại thì signin để lấy id
  try {
    const req = new Request('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: d.email,
        password: DEMO_PASSWORD,
        name: d.name,
        role: d.role,
      }),
    })
    const res = await auth.handler(req)
    if (res.status === 200) {
      const body = (await res.json()) as { user?: { id: string } }
      if (body.user?.id) {
        console.log(`  ✅ Created user ${d.email} (${body.user.id})`)
        return body.user.id
      }
    }
  } catch {
    /* fallthrough to signin */
  }

  // Signin để lấy id
  const req = new Request('http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: d.email, password: DEMO_PASSWORD }),
  })
  const res = await auth.handler(req)
  if (res.status !== 200) throw new Error(`Cannot signin ${d.email}: ${res.status}`)
  const body = (await res.json()) as { user?: { id: string } }
  if (!body.user?.id) throw new Error(`Signin ${d.email} returned no user id`)
  console.log(`  ↻ User ${d.email} đã tồn tại (${body.user.id})`)
  return body.user.id
}

async function migrateEntity(d: DemoUser, userId: string) {
  // 1. Tạo entity mới với id = userId, copy properties từ legacy seed nếu có
  // 2. Move tất cả relationships từ legacy seed → entity mới
  // 3. Delete legacy seed
  await runQuery(
    `
    // Tạo/update entity với userId
    MERGE (newE:${d.label} {id: $userId})
    ON CREATE SET
      newE.user_id = $userId,
      newE.name = $name,
      newE.email = $email,
      newE.created_at = datetime()

    WITH newE
    OPTIONAL MATCH (oldE:${d.label} {id: $legacyId})
    WHERE oldE <> newE

    // Copy properties từ legacy nếu có (giữ name từ legacy nếu có)
    FOREACH (_ IN CASE WHEN oldE IS NOT NULL THEN [1] ELSE [] END |
      SET newE += apoc.map.removeKeys(properties(oldE), ['id'])
      SET newE.id = $userId, newE.user_id = $userId
    )

    WITH newE, oldE
    WHERE oldE IS NOT NULL

    // Move outgoing rels
    CALL {
      WITH newE, oldE
      MATCH (oldE)-[r]->(target)
      WITH newE, oldE, r, target, type(r) AS relType, properties(r) AS relProps
      CALL apoc.create.relationship(newE, relType, relProps, target) YIELD rel
      DELETE r
      RETURN count(rel) AS movedOut
    }

    // Move incoming rels
    CALL {
      WITH newE, oldE
      MATCH (source)-[r]->(oldE)
      WITH newE, oldE, r, source, type(r) AS relType, properties(r) AS relProps
      CALL apoc.create.relationship(source, relType, relProps, newE) YIELD rel
      DELETE r
      RETURN count(rel) AS movedIn
    }

    DELETE oldE
    `,
    { userId, legacyId: d.legacySeedId, name: d.name, email: d.email },
    'WRITE',
  ).catch(async (err) => {
    // Fallback nếu APOC không có — chỉ tạo entity mới, giữ nguyên legacy seed
    console.log(`  ⚠️  APOC unavailable, fallback: chỉ tạo entity mới (legacy seed giữ nguyên)`)
    console.log(`     Error: ${err instanceof Error ? err.message : 'unknown'}`)
    await runQuery(
      `
      MERGE (e:${d.label} {id: $userId})
      ON CREATE SET
        e.user_id = $userId,
        e.name = $name,
        e.email = $email,
        e.created_at = datetime()
      `,
      { userId, name: d.name, email: d.email },
      'WRITE',
    )
  })
}

async function main() {
  console.log('🌱 Migration: demo seed entities → auth users\n')

  for (const d of DEMO_USERS) {
    console.log(`\n[${d.role}] ${d.email}`)
    const userId = await ensureUser(d)
    await migrateEntity(d, userId)
    console.log(`  ✅ ${d.label} entity linked to user ${userId}`)
  }

  console.log('\n✨ Migration done!\n')
  console.log('📝 Demo accounts:')
  for (const d of DEMO_USERS) {
    console.log(`   ${d.role.padEnd(12)} ${d.email}  (mật khẩu: ${DEMO_PASSWORD})`)
  }

  await getDriver().close()
}

main().catch(async (err) => {
  console.error('❌ Migration failed:', err)
  await getDriver().close()
  process.exit(1)
})
