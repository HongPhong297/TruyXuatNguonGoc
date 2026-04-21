'use server'

/**
 * Server Actions — Packing + QR (Distributor role)
 * Nhận Product đã xử lý → tạo RetailPack với QR code unique
 */
import { runQuery } from '@/lib/neo4j'
import { generatePackQr, countNodes } from '@/lib/graph/ingest-helpers'
import { publishNotification } from '@/lib/realtime-server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const CreatePackSchema = z.object({
  distributorId: z.string().min(1),
  retailerId: z.string().optional(),
  inputProductId: z.string().min(1),
  commodityId: z.enum(['coffee', 'rice', 'vegetable']),
  sku: z.string().min(1),
  weightG: z.coerce.number().positive(),
  packagedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  locationCode: z.string().default('VN'),
})

export async function createRetailPackAction(formData: FormData) {
  const parsed = CreatePackSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors }
  }

  const d = parsed.data
  const seq = (await countNodes('RetailPack')) + 1
  const packId = `pack-${d.commodityId}-${String(seq).padStart(3, '0')}`
  const qrCode = generatePackQr(d.commodityId, d.locationCode, seq)

  await runQuery(`
    MATCH (input:Product {id: $inputProductId})
    MATCH (dist:Distributor {id: $distributorId})

    MERGE (pack:RetailPack {id: $packId})
    SET pack += {
      qr_code: $qrCode, sku: $sku, commodity_id: $commodityId,
      weight_g: $weightG, packaged_date: $packagedDate, expiry_date: $expiryDate
    }

    MERGE (input)-[:PACKAGED_INTO]->(pack)
    MERGE (pack)-[:DISTRIBUTED_BY]->(dist)

    WITH pack
    OPTIONAL MATCH (r:Retailer {id: $retailerId})
    FOREACH (_ IN CASE WHEN r IS NOT NULL THEN [1] ELSE [] END |
      MERGE (pack)-[:SOLD_AT]->(r)
    )
  `, {
    inputProductId: d.inputProductId,
    distributorId: d.distributorId,
    retailerId: d.retailerId ?? '',
    packId, qrCode,
    commodityId: d.commodityId,
    sku: d.sku,
    weightG: d.weightG,
    packagedDate: d.packagedDate,
    expiryDate: d.expiryDate,
  }, 'WRITE')

  revalidatePath('/distributor')
  void publishNotification({
    event: 'pack.created',
    title: 'RetailPack mới',
    body: `QR ${qrCode} vừa được tạo`,
    qrCode,
    commodityId: d.commodityId,
  })
  return { ok: true, packId, qrCode }
}

/** Lấy danh sách RetailPack đã tạo */
export async function getMyPacks(distributorId: string) {
  return runQuery<{ pack: Record<string, unknown> }>(`
    MATCH (pack:RetailPack)-[:DISTRIBUTED_BY]->(d:Distributor {id: $distributorId})
    RETURN pack { .* } AS pack
    ORDER BY pack.packaged_date DESC
    LIMIT 20
  `, { distributorId })
}

/** Lấy Products sẵn sàng đóng gói (là stage cuối của commodity) */
export async function getReadyToPack() {
  return runQuery<{ product: Record<string, unknown> }>(`
    MATCH (p:Product)
    WHERE NOT (p)-[:PACKAGED_INTO]->(:RetailPack)
    AND NOT (p)-[:TRANSFORMED_BY]->(:ProcessEvent)
    RETURN p { .* } AS product
    ORDER BY p.batch_code DESC
    LIMIT 30
  `)
}
