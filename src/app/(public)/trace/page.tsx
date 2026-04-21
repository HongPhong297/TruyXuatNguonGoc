'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, QrCode } from 'lucide-react'

const DEMO_CODES = [
  { code: 'CFE-DL-2026-PACK-001', label: '☕ Cà phê Đắk Lắk' },
  { code: 'RICE-ST-2026-PACK-001', label: '🌾 Gạo ST25 Sóc Trăng' },
  { code: 'VEG-DL-2026-PACK-001', label: '🥬 Rau hữu cơ Đà Lạt' },
]

export default function TracePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/trace/${encodeURIComponent(q)}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <QrCode className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tra cứu nguồn gốc</h1>
        <p className="text-gray-500 text-sm">Nhập mã lô hàng trên bao bì để xem hành trình sản phẩm</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="VD: CFE-DL-2026-PACK-001"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Tra cứu
        </button>
      </form>

      {/* Demo QR codes */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">Dữ liệu demo — click để xem</p>
        <div className="grid gap-2">
          {DEMO_CODES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => router.push(`/trace/${code}`)}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors text-left group"
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">{label}</p>
                <p className="font-mono text-xs text-gray-400 mt-0.5">{code}</p>
              </div>
              <Search className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
