/**
 * Cytoscape graph component — dynamic import (client-only)
 * react-cytoscapejs yêu cầu browser API, không thể SSR
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import type { CytoElement } from '@/lib/graph/serialize'

interface CytoscapeGraphProps {
  elements: CytoElement[]
  height?: number
}

export default function CytoscapeGraph({ elements, height = 420 }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return

    let cy: unknown = null

    async function init() {
      // Dynamic import — tránh SSR errors
      const cytoscape = (await import('cytoscape')).default

      cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              'label': 'data(label)',
              'color': 'data(textColor)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '11px',
              'font-weight': 'bold',
              'width': '120px',
              'height': '40px',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              'shape': 'data(shape)' as any,
              'text-wrap': 'wrap',
              'text-max-width': '110px',
              'padding': '8px',
            },
          },
          {
            selector: 'node[type = "RetailPack"]',
            style: {
              'width': '100px',
              'height': '100px',
              'font-size': '10px',
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': 'data(color)',
              'target-arrow-color': 'data(color)',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '9px',
              'color': '#6b7280',
              'text-background-color': '#ffffff',
              'text-background-opacity': 1,
              'text-background-padding': '2px',
            },
          },
        ],
        layout: {
          name: 'breadthfirst',
          directed: true,
          padding: 30,
          spacingFactor: 1.4,
          animate: false,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        minZoom: 0.3,
        maxZoom: 3,
      })

      setLoading(false)
    }

    init()

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cy) (cy as any).destroy()
    }
  }, [elements])

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-sm text-gray-400">Đang tải đồ thị...</div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-xs">
        {[
          { color: '#16a34a', label: 'Nông trại' },
          { color: '#0891b2', label: 'Sản phẩm' },
          { color: '#2563eb', label: 'Cơ sở' },
          { color: '#dc2626', label: 'Bán lẻ' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-gray-200">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
