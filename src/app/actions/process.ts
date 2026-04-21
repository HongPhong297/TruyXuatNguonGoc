'use server'

/**
 * Server Actions — Process (Facility role)
 * Nhận Product đầu vào → tạo ProcessEvent + Product mới cho stage tiếp theo
 */
import { runQuery } from '@/lib/neo4j'
import { generateBatchCode, countNodes } from '@/lib/graph/ingest-helpers'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const ProcessSchema = z.object({
  facilityId: z.string().min(1),
  inputProductId: z.string().min(1),     // Product đầu vào
  commodityId: z.enum(['coffee', 'rice', 'vegetable']),
  processType: z.string().min(1),        // 'process' | 'roast' | 'mill' | 'wash'
  processLabel: z.string().min(1),       // 'Sơ chế Honey' | 'Rang Medium'
  fromStage: z.string().min(1),
  toStage: z.string().min(1),
  performedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  locationCode: z.string().default('VN'),
  // Dynamic attributes — encode là JSON string từ form
  attributes: z.string().default('{}'),
})

export async function recordProcessAction(formData: FormData) {
  const parsed = ProcessSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors }
  }

  const d = parsed.data
  const seq = (await countNodes('Product')) + 1
  const outputProductId = `prod-${d.commodityId}-${d.toStage}-${String(seq).padStart(3, '0')}`
  const batchCode = generateBatchCode(d.commodityId, d.locationCode, d.toStage, seq)
  const eventId = `pe-${d.processType}-${outputProductId}`

  await runQuery(`
    MATCH (input:Product {id: $inputProductId})
    MATCH (facility:Facility {id: $facilityId})

    MERGE (output:Product {id: $outputProductId})
    SET output += {commodity_id: $commodityId, stage: $toStage,
                   batch_code: $batchCode, attributes: $attributes}

    MERGE (ev:ProcessEvent {id: $eventId})
    SET ev += {type: $processType, label: $processLabel, commodity_id: $commodityId,
                from_stage: $fromStage, to_stage: $toStage, performed_at: $performedAt}

    MERGE (input)-[:TRANSFORMED_BY]->(ev)
    MERGE (ev)-[:CREATED]->(output)
    MERGE (facility)-[:PERFORMED]->(ev)
  `, {
    inputProductId: d.inputProductId,
    facilityId: d.facilityId,
    outputProductId, batchCode,
    commodityId: d.commodityId,
    toStage: d.toStage, fromStage: d.fromStage,
    processType: d.processType, processLabel: d.processLabel,
    performedAt: d.performedAt,
    attributes: d.attributes,
    eventId,
  }, 'WRITE')

  revalidatePath('/facility')
  return { ok: true, outputProductId, batchCode }
}

/** Lấy danh sách Product chờ xử lý (chưa có TRANSFORMED_BY) theo commodity */
export async function getPendingBatches(commodityId?: string) {
  const where = commodityId ? 'WHERE p.commodity_id = $commodityId' : ''
  return runQuery<{ product: Record<string, unknown> }>(`
    MATCH (p:Product)
    ${where}
    WHERE NOT (p)-[:TRANSFORMED_BY]->(:ProcessEvent)
    AND NOT (p)<-[:PACKAGED_INTO]-(:RetailPack)
    RETURN p { .* } AS product
    ORDER BY p.batch_code DESC
    LIMIT 30
  `, { commodityId })
}
