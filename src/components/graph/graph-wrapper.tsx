/**
 * Wrapper client component cho Cytoscape — bọc dynamic import với ssr:false
 * Server Components không thể dùng dynamic + ssr:false trực tiếp
 */
'use client'

import dynamic from 'next/dynamic'
import type { CytoElement } from '@/lib/graph/serialize'

const CytoscapeGraph = dynamic(() => import('./cytoscape-graph'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">Đang tải đồ thị...</p>
    </div>
  ),
})

interface GraphWrapperProps {
  elements: CytoElement[]
  height?: number
}

export default function GraphWrapper({ elements, height }: GraphWrapperProps) {
  return <CytoscapeGraph elements={elements} height={height} />
}
