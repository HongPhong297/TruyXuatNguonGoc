import type { CommodityConfig } from './types'

/** ☕ Cà phê — Đắk Lắk, Lâm Đồng */
export const coffee: CommodityConfig = {
  id: 'coffee',
  name: 'Cà phê',
  icon: '☕',
  description: 'Robusta & Arabica — từ vườn đến ly',
  origin: 'Đắk Lắk, Lâm Đồng',
  color: 'amber',
  stages: [
    {
      id: 'cherry',
      label: 'Quả tươi',
      fields: ['variety', 'weight_kg', 'harvest_date', 'altitude_m'],
    },
    {
      id: 'green',
      label: 'Nhân xanh',
      fields: ['process_method', 'moisture_pct', 'cupping_score', 'screen_size'],
    },
    {
      id: 'roasted',
      label: 'Cà phê rang',
      fields: ['roast_profile', 'roast_date', 'roast_level', 'weight_loss_pct'],
    },
    {
      id: 'packed',
      label: 'Đóng gói',
      fields: ['weight_g', 'grind_type', 'packaged_date', 'expiry_date'],
    },
  ],
  processes: [
    {
      id: 'harvest',
      label: 'Thu hoạch',
      from: null,
      to: 'cherry',
      performer: 'farmer',
    },
    {
      id: 'process',
      label: 'Sơ chế',
      from: 'cherry',
      to: 'green',
      performer: 'facility',
    },
    {
      id: 'roast',
      label: 'Rang',
      from: 'green',
      to: 'roasted',
      performer: 'facility',
    },
    {
      id: 'pack',
      label: 'Đóng gói',
      from: 'roasted',
      to: 'packed',
      performer: 'distributor',
    },
  ],
  certifications: ['VietGAP', 'Organic', 'Rainforest Alliance', 'Fair Trade', 'UTZ'],
}
