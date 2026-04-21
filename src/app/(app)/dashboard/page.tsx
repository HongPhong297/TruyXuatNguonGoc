import { vi } from '@/lib/i18n/vi'
import { BarChart3, Package, Sprout, AlertTriangle, QrCode } from 'lucide-react'
import {
  getDashboardStats, getCommodityStats, getExpiringCerts, getRecentPacks,
} from '@/lib/graph/analytics'
import {
  CommodityBarChartLazy, CommodityPieChartLazy, CertExpiryChartLazy,
} from '@/components/charts/charts-wrapper'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tổng quan' }

export default async function DashboardPage() {
  // Parallel data fetch
  const [stats, commodityStats, expiringCerts, recentPackRows] = await Promise.all([
    getDashboardStats(),
    getCommodityStats(),
    getExpiringCerts(),
    getRecentPacks(),
  ])

  const recentPacks = recentPackRows.map(r => r.pack)

  const statCards = [
    { icon: Package,       label: vi.dashboard.totalBatches,     value: stats.totalRetailPacks, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { icon: BarChart3,     label: vi.dashboard.activeBatches,    value: stats.totalProducts,    color: 'text-green-600',  bg: 'bg-green-50' },
    { icon: Sprout,        label: vi.dashboard.farmCount,        value: stats.totalFarms,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: AlertTriangle, label: vi.dashboard.certExpiringSoon, value: stats.certExpiringSoon, color: 'text-amber-600',  bg: 'bg-amber-50' },
  ]

  // Pie data — lấy từ commodityStats
  const pieData = commodityStats.map(c => ({ name: c.icon + ' ' + c.name, value: c.packs, color: c.color }))

  // Bar data — reshape
  const barData = commodityStats.map(c => ({ name: c.icon + ' ' + c.name, packs: c.packs, farms: c.farms, color: c.color }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{vi.dashboard.title}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm">📊 Lô hàng theo sản phẩm</h2>
          {barData.length > 0
            ? <CommodityBarChartLazy data={barData} />
            : <EmptyChart />
          }
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm">🥧 Tỷ lệ phân bố</h2>
          {pieData.length > 0
            ? <CommodityPieChartLazy data={pieData} />
            : <EmptyChart />
          }
        </div>
      </div>

      {/* Bottom row: Cert expiry + Recent packs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cert expiry */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm">⏰ Chứng nhận sắp hết hạn</h2>
          {expiringCerts.length > 0 ? (
            <CertExpiryChartLazy data={expiringCerts.map(c => ({
              name: c.farmName, daysLeft: c.daysLeft, standard: c.standard,
            }))} />
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              <p className="text-2xl mb-2">✅</p>
              <p>Tất cả chứng nhận còn hạn &gt; 90 ngày</p>
            </div>
          )}
        </div>

        {/* Recent packs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm">📦 Lô hàng gần đây</h2>
          {recentPacks.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="space-y-2">
              {recentPacks.map((pack, i) => (
                <Link
                  key={i}
                  href={`/trace/${pack.qr_code}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                    <div>
                      <p className="font-mono text-xs font-medium text-gray-700">{String(pack.qr_code ?? '')}</p>
                      <p className="text-xs text-gray-400">{String(pack.packaged_date ?? '')}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                    {String(pack.commodity_id ?? '')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
      <div className="text-center">
        <p className="text-2xl mb-2">📊</p>
        <p>Chưa có dữ liệu</p>
      </div>
    </div>
  )
}
