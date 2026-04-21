/**
 * Form thu hoạch — client component
 * Khi chọn commodity, fields render động theo CommodityConfig.stages[0].fields
 */
'use client'

import { useState, useTransition } from 'react'
import { recordHarvestAction } from '@/app/actions/farm'
import { COMMODITY_REGISTRY } from '@/lib/commodities/registry'
import { Loader2, CheckCircle } from 'lucide-react'

interface HarvestFormProps {
  farmId: string
  commodityId: string
  farmerId: string
}

export default function HarvestForm({ farmId, commodityId, farmerId }: HarvestFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; batchCode?: string; error?: unknown } | null>(null)
  const commodity = COMMODITY_REGISTRY[commodityId]
  const firstStage = commodity?.stages[0]

  if (!commodity || !firstStage) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('farmId', farmId)
    formData.set('farmerId', farmerId)
    formData.set('commodityId', commodityId)
    formData.set('firstStage', firstStage!.id)

    startTransition(async () => {
      const res = await recordHarvestAction(formData)
      setResult(res)
    })
  }

  if (result?.ok) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-semibold text-green-700 text-sm">Thu hoạch đã ghi nhận!</p>
          <p className="font-mono text-xs text-green-600 mt-0.5">{result.batchCode}</p>
        </div>
        <button onClick={() => setResult(null)} className="ml-auto text-xs text-green-600 hover:underline">
          Ghi thêm
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Stage label đầu tiên */}
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1">Stage: <strong>{firstStage.label}</strong> — {commodity.name}</p>
        </div>

        {/* Trọng lượng — luôn có */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Khối lượng (kg) *</label>
          <input type="number" name="weightKg" required step="0.1" min="0.1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        {/* Ngày thu hoạch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thu hoạch *</label>
          <input type="date" name="harvestDate" required defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        {/* Giống — nếu stage có field variety */}
        {firstStage.fields.includes('variety') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giống</label>
            <input type="text" name="variety" placeholder={commodity.id === 'coffee' ? 'Robusta / Arabica' : commodity.id === 'rice' ? 'ST25' : ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        )}

        {/* Altitude — coffee */}
        {firstStage.fields.includes('altitude_m') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ cao (m)</label>
            <input type="number" name="altitudeM" placeholder="600"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        )}

        {/* Moisture — rice */}
        {firstStage.fields.includes('moisture_pct') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ ẩm (%)</label>
            <input type="number" name="moisturePct" step="0.1" placeholder="22"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        )}

        {/* Field ID — vegetable */}
        {firstStage.fields.includes('field_id') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã luống rau</label>
            <input type="text" name="fieldId" placeholder="F-DL-A1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        )}
      </div>

      <input type="hidden" name="locationCode" value="VN" />

      <button type="submit" disabled={isPending}
        className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Ghi nhận thu hoạch
      </button>
    </form>
  )
}
