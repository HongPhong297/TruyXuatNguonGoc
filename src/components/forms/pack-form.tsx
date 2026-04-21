/**
 * Form đóng gói + tạo QR — Distributor role
 * Input: productId, commodity → Output: RetailPack + QR code
 */
'use client'

import { useState, useTransition } from 'react'
import { createRetailPackAction } from '@/app/actions/pack'
import { Loader2, CheckCircle, QrCode } from 'lucide-react'
import Link from 'next/link'

interface PackFormProps {
  distributorId: string
  availableProducts: Array<{ batch_code: string; id: string; commodity_id: string; stage: string }>
}

export default function PackForm({ distributorId, availableProducts }: PackFormProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; qrCode?: string; error?: unknown } | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const expiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('distributorId', distributorId)
    startTransition(async () => {
      const res = await createRetailPackAction(formData)
      setResult(res)
    })
  }

  if (result?.ok) {
    return (
      <div className="p-5 bg-green-50 border border-green-200 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="font-semibold text-green-700">RetailPack đã tạo!</p>
        </div>
        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Mã QR:</p>
            <p className="font-mono font-bold text-gray-800">{result.qrCode}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trace/${result.qrCode}`}
            className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800">
            Xem trace
          </Link>
          <button onClick={() => setResult(null)} className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            Tạo thêm
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Chọn Product */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lô sản phẩm *</label>
        {availableProducts.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Chưa có lô sẵn sàng đóng gói</p>
        ) : (
          <select name="inputProductId" required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
            {availableProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.batch_code} ({p.stage})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commodity *</label>
          <select name="commodityId" required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
            <option value="coffee">☕ Cà phê</option>
            <option value="rice">🌾 Gạo</option>
            <option value="vegetable">🥬 Rau</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input type="text" name="sku" required placeholder="CFE-MEDIUM-250G"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Khối lượng (g) *</label>
          <input type="number" name="weightG" required step="1" min="1" placeholder="250"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã vị trí</label>
          <input type="text" name="locationCode" defaultValue="VN" maxLength={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đóng gói *</label>
          <input type="date" name="packagedDate" required defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng *</label>
          <input type="date" name="expiryDate" required defaultValue={expiry}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
      </div>

      <button type="submit" disabled={isPending || availableProducts.length === 0}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
        Tạo RetailPack + QR Code
      </button>
    </form>
  )
}
