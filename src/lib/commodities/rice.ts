import type { CommodityConfig } from './types'

/** 🌾 Gạo ST25 — Sóc Trăng, ĐBSCL */
export const rice: CommodityConfig = {
  id: 'rice',
  name: 'Gạo ST25',
  icon: '🌾',
  description: 'Gạo ngon nhất thế giới — từ ruộng đến nồi',
  origin: 'Sóc Trăng, ĐBSCL',
  color: 'green',
  stages: [
    {
      id: 'paddy',
      label: 'Lúa tươi',
      fields: ['variety', 'weight_kg', 'harvest_date', 'moisture_pct'],
    },
    {
      id: 'milled',
      label: 'Gạo xát',
      fields: ['polish_grade', 'broken_pct', 'head_rice_pct', 'milling_date'],
    },
    {
      id: 'packed',
      label: 'Đóng bao',
      fields: ['weight_kg', 'bag_type', 'packaged_date', 'expiry_date'],
    },
  ],
  processes: [
    {
      id: 'harvest',
      label: 'Thu hoạch',
      from: null,
      to: 'paddy',
      performer: 'farmer',
    },
    {
      id: 'mill',
      label: 'Xay xát',
      from: 'paddy',
      to: 'milled',
      performer: 'facility',
    },
    {
      id: 'pack',
      label: 'Đóng bao',
      from: 'milled',
      to: 'packed',
      performer: 'facility',
    },
  ],
  certifications: ['VietGAP', 'GlobalGAP', 'SRP', 'Organic'],
}
