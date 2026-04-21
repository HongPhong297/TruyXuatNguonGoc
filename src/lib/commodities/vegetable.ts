import type { CommodityConfig } from './types'

/** 🥬 Rau hữu cơ — Đà Lạt, Lâm Đồng */
export const vegetable: CommodityConfig = {
  id: 'vegetable',
  name: 'Rau hữu cơ',
  icon: '🥬',
  description: 'Rau sạch hữu cơ — từ luống rau đến bữa cơm',
  origin: 'Đà Lạt, Lâm Đồng',
  color: 'emerald',
  stages: [
    {
      id: 'raw',
      label: 'Rau tươi',
      fields: ['variety', 'weight_kg', 'harvest_date', 'field_id'],
    },
    {
      id: 'washed',
      label: 'Rau sơ chế',
      fields: ['wash_method', 'wash_date', 'weight_after_kg'],
    },
    {
      id: 'packed',
      label: 'Đóng gói',
      fields: ['weight_g', 'pack_type', 'packaged_date', 'expiry_date'],
    },
  ],
  processes: [
    {
      id: 'harvest',
      label: 'Thu hoạch',
      from: null,
      to: 'raw',
      performer: 'farmer',
    },
    {
      id: 'wash',
      label: 'Sơ chế',
      from: 'raw',
      to: 'washed',
      performer: 'facility',
    },
    {
      id: 'pack',
      label: 'Đóng gói',
      from: 'washed',
      to: 'packed',
      performer: 'facility',
    },
  ],
  certifications: ['VietGAP', 'Organic', 'PGS', 'GlobalGAP'],
}
