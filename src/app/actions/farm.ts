'use server'

/**
 * Server Actions — Farm + Harvest ingest (Farmer role)
 */
import { runQuery } from '@/lib/neo4j'
import { generateBatchCode, countNodes } from '@/lib/graph/ingest-helpers'
import { publishNotification } from '@/lib/realtime-server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ────────────────────────────────────────────────────────────────────────────
// CREATE FARM
// ────────────────────────────────────────────────────────────────────────────

const CreateFarmSchema = z.object({
  farmerId: z.string().min(1),
  name: z.string().min(2),
  commodityId: z.enum(['coffee', 'rice', 'vegetable']),
  province: z.string().min(2),
  areaHa: z.coerce.number().positive(),
  altitudeM: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
})

export async function createFarmAction(formData: FormData) {
  const parsed = CreateFarmSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors }
  }

  const { farmerId, name, commodityId, province, areaHa, altitudeM, lat, lng } = parsed.data
  const seq = (await countNodes('Farm')) + 1
  const farmId = `farm-${commodityId}-${String(seq).padStart(3, '0')}`

  await runQuery(`
    MERGE (farmer:Farmer {id: $farmerId})
    MERGE (farm:Farm {id: $farmId})
    SET farm += {
      name: $name, commodity_id: $commodityId, province: $province,
      area_ha: $areaHa, altitude_m: $altitudeM, lat: $lat, lng: $lng
    }
    MERGE (farmer)-[:OWNS]->(farm)
  `, { farmerId, farmId, name, commodityId, province, areaHa, altitudeM: altitudeM ?? null, lat: lat ?? null, lng: lng ?? null }, 'WRITE')

  revalidatePath('/farmer')
  return { ok: true, farmId }
}

// ────────────────────────────────────────────────────────────────────────────
// RECORD HARVEST (tạo Product stage đầu tiên)
// ────────────────────────────────────────────────────────────────────────────

const RecordHarvestSchema = z.object({
  farmId: z.string().min(1),
  commodityId: z.enum(['coffee', 'rice', 'vegetable']),
  firstStage: z.string().min(1),         // 'cherry' | 'paddy' | 'raw'
  locationCode: z.string().default('VN'),
  weightKg: z.coerce.number().positive(),
  harvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  // Thêm trường optional cho commodity
  variety: z.string().optional(),
  altitudeM: z.coerce.number().optional(),
  fieldId: z.string().optional(),
  moisturePct: z.coerce.number().optional(),
})

export async function recordHarvestAction(formData: FormData) {
  const parsed = RecordHarvestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors }
  }

  const data = parsed.data
  const seq = (await countNodes('Product')) + 1
  const productId = `prod-${data.commodityId}-${data.firstStage}-${String(seq).padStart(3, '0')}`
  const batchCode = generateBatchCode(data.commodityId, data.locationCode, data.firstStage, seq)

  // Build attributes JSON
  const attrs = JSON.stringify({
    variety: data.variety,
    weight_kg: data.weightKg,
    harvest_date: data.harvestDate,
    ...(data.altitudeM ? { altitude_m: data.altitudeM } : {}),
    ...(data.fieldId ? { field_id: data.fieldId } : {}),
    ...(data.moisturePct ? { moisture_pct: data.moisturePct } : {}),
  })

  const eventId = `pe-harvest-${productId}`

  await runQuery(`
    MATCH (farm:Farm {id: $farmId})
    MERGE (p:Product {id: $productId})
    SET p += {commodity_id: $commodityId, stage: $firstStage, batch_code: $batchCode, attributes: $attrs}
    MERGE (ev:ProcessEvent {id: $eventId})
    SET ev += {type: 'harvest', label: 'Thu hoạch', commodity_id: $commodityId,
                from_stage: null, to_stage: $firstStage, performed_at: $harvestDate}
    MERGE (farm)-[:PRODUCED]->(p)
  `, { farmId: data.farmId, productId, commodityId: data.commodityId,
       firstStage: data.firstStage, batchCode, attrs, eventId,
       harvestDate: data.harvestDate }, 'WRITE')

  revalidatePath('/farmer')
  // Notify realtime — fire-and-forget
  void publishNotification({
    event: 'harvest.created',
    title: 'Thu hoạch mới',
    body: `Lô ${batchCode} vừa được ghi nhận`,
    batchCode,
    commodityId: data.commodityId,
  })
  return { ok: true, productId, batchCode }
}

// ────────────────────────────────────────────────────────────────────────────
// LIST MY FARMS
// ────────────────────────────────────────────────────────────────────────────

export async function getMyFarms(farmerId: string) {
  return runQuery<{ farm: Record<string, unknown> }>(`
    MATCH (farmer:Farmer {id: $farmerId})-[:OWNS]->(farm:Farm)
    RETURN farm { .* } AS farm
    ORDER BY farm.name
  `, { farmerId })
}

export async function getMyHarvests(farmerId: string) {
  return runQuery<{ product: Record<string, unknown>; farm: Record<string, unknown> }>(`
    MATCH (farmer:Farmer {id: $farmerId})-[:OWNS]->(farm:Farm)-[:PRODUCED]->(p:Product)
    RETURN p { .* } AS product, farm { .name, .province } AS farm
    ORDER BY p.batch_code DESC
    LIMIT 20
  `, { farmerId })
}
