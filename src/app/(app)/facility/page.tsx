import { vi } from '@/lib/i18n/vi'
import { Factory } from 'lucide-react'
import { getPendingBatches } from '@/app/actions/process'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cơ sở chế biến' }

export default async function FacilityPage() {
  const pendingRows = await getPendingBatches()
  const pendingBatches = pendingRows.map(r => r.product)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Factory className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">{vi.facility.title}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lô chờ xử lý */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{vi.facility.pendingBatches}</h2>
          {pendingBatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p className="text-3xl mb-3">⏳</p>
              <p>{vi.common.noData}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingBatches.map((p, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <p className="font-mono font-medium text-gray-700">{String(p.batch_code ?? '')}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{String(p.commodity_id ?? '')}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{String(p.stage ?? '')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form process — placeholder interactive */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{vi.facility.recordProcess}</h2>
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-2xl mb-2">🏭</p>
            <p className="text-xs text-gray-500">Chọn lô từ danh sách bên trái</p>
            <p className="text-xs text-gray-400 mt-1">Form process đầy đủ ở Phase 08</p>
          </div>
        </div>
      </div>
    </div>
  )
}
