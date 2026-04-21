import { vi } from '@/lib/i18n/vi'
import { Truck } from 'lucide-react'
import { getReadyToPack } from '@/app/actions/pack'
import PackForm from '@/components/forms/pack-form'
import { requireRole } from '@/lib/auth-helpers'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Phân phối' }

const DEMO_DISTRIBUTOR_ID = 'dist-001'

export default async function DistributorPage() {
  await requireRole('distributor')
  const readyRows = await getReadyToPack()
  const availableProducts = readyRows.map(r => r.product as {
    id: string; batch_code: string; commodity_id: string; stage: string
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-6 h-6 text-amber-600" />
        <h1 className="text-2xl font-bold text-gray-800">{vi.distributor.title}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lô sẵn sàng đóng gói */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Lô sẵn sàng đóng gói</h2>
          {availableProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p className="text-3xl mb-3">📦</p>
              <p>Chưa có lô nào sẵn sàng</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableProducts.map((p, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <p className="font-mono font-medium text-gray-700">{p.batch_code}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{p.commodity_id}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form tạo RetailPack + QR */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{vi.distributor.packageRetail}</h2>
          <PackForm
            distributorId={DEMO_DISTRIBUTOR_ID}
            availableProducts={availableProducts}
          />
        </div>
      </div>
    </div>
  )
}
