/**
 * Chart lazy-load wrappers — ssr:false để tránh recharts/window issues
 * Mỗi chart là 1 dynamic import riêng
 */
'use client'

import dynamic from 'next/dynamic'

const Loading = () => (
  <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
    Đang tải biểu đồ...
  </div>
)

export const CommodityBarChartLazy = dynamic(
  () => import('./dashboard-charts').then(m => ({ default: m.CommodityBarChart })),
  { ssr: false, loading: Loading }
)

export const CommodityPieChartLazy = dynamic(
  () => import('./dashboard-charts').then(m => ({ default: m.CommodityPieChart })),
  { ssr: false, loading: Loading }
)

export const CertExpiryChartLazy = dynamic(
  () => import('./dashboard-charts').then(m => ({ default: m.CertExpiryChart })),
  { ssr: false, loading: Loading }
)
