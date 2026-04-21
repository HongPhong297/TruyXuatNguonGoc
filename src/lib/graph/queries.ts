/**
 * Cypher query builders cho trace và ingest
 * Tất cả queries đều generic — hoạt động cho mọi commodity
 */
import { runQuery } from '@/lib/neo4j'

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface TraceNode {
  id: string
  type: string        // 'Farm' | 'Farmer' | 'Facility' | 'Product' | 'RetailPack' | etc.
  label: string       // Tên hiển thị
  properties: Record<string, unknown>
}

export interface TraceEdge {
  source: string
  target: string
  type: string        // 'PRODUCED' | 'TRANSFORMED_BY' | 'PACKAGED_INTO' | etc.
  properties: Record<string, unknown>
}

export interface TraceResult {
  pack: Record<string, unknown>
  nodes: TraceNode[]
  edges: TraceEdge[]
  farms: Record<string, unknown>[]
  certifications: Record<string, unknown>[]
  facilities: Record<string, unknown>[]
  products: Record<string, unknown>[]
  found: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// TRACE — truy xuất từ QR code ngược về farm
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy toàn bộ thông tin trace từ QR code (hoặc batch code)
 * Trả về nodes + edges để render Cytoscape
 */
export async function traceByQr(qrCode: string): Promise<TraceResult> {
  // Step 1: Tìm retail pack
  const packRows = await runQuery<{ pack: Record<string, unknown> }>(`
    MATCH (pack:RetailPack {qr_code: $qr})
    RETURN pack { .* } AS pack
    LIMIT 1
  `, { qr: qrCode })

  if (packRows.length === 0) {
    return { pack: {}, nodes: [], edges: [], farms: [], certifications: [], facilities: [], products: [], found: false }
  }

  const pack = packRows[0].pack as Record<string, unknown>

  // Step 2: Lấy toàn bộ Products trong chain
  const productRows = await runQuery<{ p: Record<string, unknown> }>(`
    MATCH (pack:RetailPack {qr_code: $qr})<-[:PACKAGED_INTO]-(p:Product)
    OPTIONAL MATCH (p)<-[:CREATED*0..10]-(:ProcessEvent)<-[:TRANSFORMED_BY*0..10]-(ancestor:Product)
    WITH collect(DISTINCT p) + collect(DISTINCT ancestor) AS prods
    UNWIND prods AS p
    RETURN p { .* } AS p
  `, { qr: qrCode })
  const products = productRows.map(r => r.p as Record<string, unknown>)

  // Step 3: Farm + Farmer + Cert
  const farmRows = await runQuery<{
    farm: Record<string, unknown>
    farmer: Record<string, unknown> | null
    cert: Record<string, unknown> | null
  }>(`
    MATCH (pack:RetailPack {qr_code: $qr})<-[:PACKAGED_INTO]-(p:Product)
    MATCH (farm:Farm {commodity_id: p.commodity_id})-[:PRODUCED]->(:Product)
    OPTIONAL MATCH (farmer:Farmer)-[:OWNS]->(farm)
    OPTIONAL MATCH (farm)-[:CERTIFIED_BY]->(cert:Certification)
    RETURN farm { .* } AS farm, farmer { .* } AS farmer, cert { .* } AS cert
    LIMIT 1
  `, { qr: qrCode })

  const farms = farmRows.map(r => r.farm as Record<string, unknown>)
  const certifications = farmRows.flatMap(r => r.cert ? [r.cert as Record<string, unknown>] : [])

  // Step 4: Facilities (performers)
  const facilityRows = await runQuery<{ facility: Record<string, unknown> }>(`
    MATCH (pack:RetailPack {qr_code: $qr})<-[:PACKAGED_INTO]-(p:Product)
    MATCH (p)<-[:CREATED*0..10]-(:ProcessEvent)<-[:PERFORMED]-(facility:Facility)
    RETURN DISTINCT facility { .* } AS facility
  `, { qr: qrCode })
  const facilities = facilityRows.map(r => r.facility as Record<string, unknown>)

  // Step 5: Build simple nodes array cho Cytoscape
  const nodes: TraceNode[] = [
    ...farms.map(f => ({ id: String(f.id), type: 'Farm', label: String(f.name), properties: f })),
    ...products.map(p => ({ id: String(p.id), type: 'Product', label: `${p.stage} (${p.batch_code})`, properties: p })),
    ...facilities.map(f => ({ id: String(f.id), type: 'Facility', label: String(f.name), properties: f })),
    { id: String(pack.id), type: 'RetailPack', label: String(pack.qr_code), properties: pack },
  ]

  // Edges đơn giản — Phase 06 sẽ build từ relationship queries
  const edges: TraceEdge[] = []

  return { pack, nodes, edges, farms, certifications, facilities, products, found: true }
}

// ────────────────────────────────────────────────────────────────────────────
// AGGREGATE — cho dashboard
// ────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRetailPacks: number
  totalFarms: number
  certExpiringSoon: number   // expires trong 30 ngày
  totalByCommodity: { commodity_id: string; count: number }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [packCount, farmCount, certCount, byCommodity] = await Promise.all([
    runQuery<{ count: number }>('MATCH (p:RetailPack) RETURN count(p) AS count'),
    runQuery<{ count: number }>('MATCH (f:Farm) RETURN count(f) AS count'),
    runQuery<{ count: number }>(`
      MATCH (c:Certification)
      WHERE date(c.expires_date) <= date() + duration({days: 30})
      RETURN count(c) AS count
    `),
    runQuery<{ commodity_id: string; count: number }>(`
      MATCH (p:RetailPack)
      RETURN p.commodity_id AS commodity_id, count(p) AS count
      ORDER BY count DESC
    `),
  ])

  return {
    totalRetailPacks: Number(packCount[0]?.count ?? 0),
    totalFarms: Number(farmCount[0]?.count ?? 0),
    certExpiringSoon: Number(certCount[0]?.count ?? 0),
    totalByCommodity: byCommodity.map(r => ({
      commodity_id: r.commodity_id,
      count: Number(r.count),
    })),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// LIST — lấy danh sách retail packs theo commodity
// ────────────────────────────────────────────────────────────────────────────

export async function listRetailPacks(commodityId?: string) {
  const where = commodityId ? 'WHERE p.commodity_id = $commodityId' : ''
  return runQuery<{ pack: Record<string, unknown> }>(`
    MATCH (p:RetailPack)
    ${where}
    RETURN p { .* } AS pack
    ORDER BY p.packaged_date DESC
    LIMIT 50
  `, { commodityId })
}
