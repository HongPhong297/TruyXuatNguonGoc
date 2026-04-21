/**
 * Neo4j analytics queries cho dashboard
 * Tất cả queries trả về plain objects (toPlain() đã handle trong runQuery)
 */
import { runQuery } from '@/lib/neo4j'

export interface DashboardStats {
  totalRetailPacks: number
  totalFarms: number
  totalProducts: number
  certExpiringSoon: number
}

export interface CommodityStats {
  commodityId: string
  name: string
  icon: string
  packs: number
  farms: number
  color: string
}

export interface CertExpiry {
  farmName: string
  standard: string
  expiresDate: string
  daysLeft: number
}

const COMMODITY_META: Record<string, { name: string; icon: string; color: string }> = {
  coffee:    { name: 'Cà phê',    icon: '☕', color: '#92400e' },
  rice:      { name: 'Gạo',       icon: '🌾', color: '#16a34a' },
  vegetable: { name: 'Rau sạch',  icon: '🥬', color: '#0891b2' },
}

/** Tổng hợp stats nhanh — chạy song song */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [packs, farms, products, certs] = await Promise.all([
    runQuery<{ count: number }>('MATCH (n:RetailPack) RETURN count(n) AS count'),
    runQuery<{ count: number }>('MATCH (n:Farm) RETURN count(n) AS count'),
    runQuery<{ count: number }>('MATCH (n:Product) RETURN count(n) AS count'),
    runQuery<{ count: number }>(`
      MATCH (c:Certification)
      WHERE c.expires_date IS NOT NULL
        AND date(c.expires_date) <= date() + duration({days: 30})
        AND date(c.expires_date) >= date()
      RETURN count(c) AS count
    `),
  ])
  return {
    totalRetailPacks: Number(packs[0]?.count ?? 0),
    totalFarms:       Number(farms[0]?.count ?? 0),
    totalProducts:    Number(products[0]?.count ?? 0),
    certExpiringSoon: Number(certs[0]?.count ?? 0),
  }
}

/** Stats theo từng commodity — cho bar chart và pie chart */
export async function getCommodityStats(): Promise<CommodityStats[]> {
  const rows = await runQuery<{ commodityId: string; packs: number; farms: number }>(`
    MATCH (p:RetailPack)
    WITH p.commodity_id AS commodityId, count(p) AS packs
    OPTIONAL MATCH (f:Farm {commodity_id: commodityId})
    RETURN commodityId, packs, count(DISTINCT f) AS farms
    ORDER BY packs DESC
  `)

  return rows
    .filter(r => r.commodityId)
    .map(r => {
      const meta = COMMODITY_META[r.commodityId] ?? { name: r.commodityId, icon: '🌿', color: '#6b7280' }
      return {
        commodityId: r.commodityId,
        name: meta.name,
        icon: meta.icon,
        color: meta.color,
        packs: Number(r.packs ?? 0),
        farms: Number(r.farms ?? 0),
      }
    })
}

/** Certs sắp hết hạn trong 90 ngày tới */
export async function getExpiringCerts(): Promise<CertExpiry[]> {
  const rows = await runQuery<{
    farmName: string
    standard: string
    expiresDate: string
  }>(`
    MATCH (farm:Farm)-[:CERTIFIED_BY]->(cert:Certification)
    WHERE cert.expires_date IS NOT NULL
      AND date(cert.expires_date) <= date() + duration({days: 90})
      AND date(cert.expires_date) >= date()
    RETURN farm.name AS farmName, cert.standard AS standard,
           cert.expires_date AS expiresDate
    ORDER BY cert.expires_date
    LIMIT 10
  `)

  return rows.map(r => {
    const expires = new Date(r.expiresDate)
    const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    return {
      farmName: r.farmName ?? 'Unknown',
      standard: r.standard ?? 'N/A',
      expiresDate: r.expiresDate ?? '',
      daysLeft,
    }
  })
}

/** Recent retail packs — 5 lô mới nhất */
export async function getRecentPacks() {
  return runQuery<{ pack: Record<string, unknown> }>(`
    MATCH (p:RetailPack)
    RETURN p { .* } AS pack
    ORDER BY p.packaged_date DESC
    LIMIT 5
  `)
}
