import { vi } from '@/lib/i18n/vi'
import { Sprout, Plus } from 'lucide-react'
import HarvestForm from '@/components/forms/harvest-form'
import { requireRole } from '@/lib/auth-helpers'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nông dân' }

// Demo: dùng farm seed đã có — Phase sau kết nối auth để lấy farmerId thật
const DEMO_FARMER_ID = 'farmer-cfe-001'
const DEMO_FARMS = [
  { id: 'farm-cfe-001', name: 'Vườn cà phê Hùng Robusta', commodityId: 'coffee', province: 'Đắk Lắk' },
  { id: 'farm-rice-001', name: 'Ruộng lúa ST25 Mỹ Xuyên', commodityId: 'rice', province: 'Sóc Trăng' },
  { id: 'farm-veg-001', name: 'Vườn rau hữu cơ Bình Đà Lạt', commodityId: 'vegetable', province: 'Lâm Đồng' },
]

export default async function FarmerPage() {
  await requireRole('farmer')
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sprout className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">{vi.farmer.title}</h1>
        </div>
        <button className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          {vi.farmer.registerFarm}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Danh sách vườn */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{vi.farmer.myFarms}</h2>
          <div className="space-y-2">
            {DEMO_FARMS.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.province}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">{f.commodityId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form thu hoạch */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{vi.farmer.recordHarvest}</h2>

          {/* Chọn vườn */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Demo: form dưới đây ghi nhận thu hoạch cho vườn cà phê</p>
          </div>

          <HarvestForm
            farmId="farm-cfe-001"
            commodityId="coffee"
            farmerId={DEMO_FARMER_ID}
          />
        </div>
      </div>
    </div>
  )
}
