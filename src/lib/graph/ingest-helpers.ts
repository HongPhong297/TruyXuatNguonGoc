/**
 * Shared Neo4j write helpers + ID generators cho ingest forms
 */
import { runQuery } from '@/lib/neo4j'

/** Tạo batch code chuẩn: CFE-DL-2026-CHERRY-001 */
export function generateBatchCode(
  commodityId: string,
  locationCode: string,
  stage: string,
  seq: number
): string {
  const year = new Date().getFullYear()
  const prefix = commodityId.slice(0, 3).toUpperCase()
  const loc = locationCode.slice(0, 2).toUpperCase()
  const stg = stage.slice(0, 4).toUpperCase()
  const num = String(seq).padStart(3, '0')
  return `${prefix}-${loc}-${year}-${stg}-${num}`
}

/** Tạo QR code cho RetailPack */
export function generatePackQr(
  commodityId: string,
  locationCode: string,
  seq: number
): string {
  const year = new Date().getFullYear()
  const prefix = commodityId.slice(0, 3).toUpperCase()
  const loc = locationCode.slice(0, 2).toUpperCase()
  const num = String(seq).padStart(3, '0')
  return `${prefix}-${loc}-${year}-PACK-${num}`
}

/** Đếm số node hiện có của 1 label để tự tăng sequence */
export async function countNodes(label: string): Promise<number> {
  const rows = await runQuery<{ count: number }>(
    `MATCH (n:${label}) RETURN count(n) AS count`
  )
  return Number(rows[0]?.count ?? 0)
}
