import { vi } from '@/lib/i18n/vi'
import { Sprout, Plus } from 'lucide-react'
import HarvestForm from '@/components/forms/harvest-form'
import { requireRoleWithEntity } from '@/lib/auth-helpers'
import { getMyFarms } from '@/app/actions/farm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nông dân' }

interface FarmRow {
  id: string
  name: string
  commodity_id: string
  province: string
}

export default async function FarmerPage() {
  // Auto-create Neo4j Farmer node nếu chưa có (idempotent)
  const { entityId: farmerId, user } = await requireRoleWithEntity('farmer')

  // Lấy farms của user (có thể rỗng nếu user mới)
  const farmRows = await getMyFarms(farmerId)
  const farms = farmRows.map(r => r.farm as unknown as FarmRow)
  const firstFarm = farms[0]

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
          {farms.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              <p className="text-3xl mb-2">🌱</p>
              <p>Chưa có vườn nào</p>
              <p className="text-xs mt-1">Bấm &quot;Đăng ký vườn&quot; để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-2">
              {farms.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.province}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">{f.commodity_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form thu hoạch */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{vi.farmer.recordHarvest}</h2>

          {firstFarm ? (
            <>
              <p className="text-xs text-gray-500 mb-3">
                Ghi cho vườn: <span className="font-medium text-gray-700">{firstFarm.name}</span>
              </p>
              <HarvestForm
                farmId={firstFarm.id}
                commodityId={firstFarm.commodity_id as 'coffee' | 'rice' | 'vegetable'}
                farmerId={farmerId}
              />
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              Đăng ký vườn trước khi ghi thu hoạch ({user.email})
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
