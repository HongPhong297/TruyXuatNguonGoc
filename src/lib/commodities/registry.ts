/**
 * Registry tất cả commodity configs
 * Thêm commodity mới: import config + add vào MAP — không sửa code khác
 */
import { coffee } from './coffee'
import { rice } from './rice'
import { vegetable } from './vegetable'
import type { CommodityConfig } from './types'

/** Map<commodityId, CommodityConfig> */
export const COMMODITY_REGISTRY: Record<string, CommodityConfig> = {
  coffee,
  rice,
  vegetable,
}

/** Lấy config theo ID — throw nếu không tồn tại */
export function getCommodity(id: string): CommodityConfig {
  const config = COMMODITY_REGISTRY[id]
  if (!config) throw new Error(`Unknown commodity: "${id}". Available: ${Object.keys(COMMODITY_REGISTRY).join(', ')}`)
  return config
}

/** Danh sách tất cả commodity */
export function getAllCommodities(): CommodityConfig[] {
  return Object.values(COMMODITY_REGISTRY)
}
