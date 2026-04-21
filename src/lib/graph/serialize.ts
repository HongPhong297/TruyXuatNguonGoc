/**
 * Chuyển đổi TraceResult từ Neo4j → Cytoscape.js elements format
 * Mỗi node type có màu và shape riêng để dễ nhận biết
 */
import type { TraceResult, TraceNode } from '@/lib/graph/queries'

export interface CytoNode {
  data: {
    id: string
    label: string
    type: string
    color: string
    textColor: string
    shape: string
    properties: Record<string, unknown>
  }
}

export interface CytoEdge {
  data: {
    id: string
    source: string
    target: string
    label: string
    color: string
  }
}

export type CytoElement = CytoNode | CytoEdge

/** Màu + shape theo loại node */
const NODE_STYLE: Record<string, { color: string; textColor: string; shape: string }> = {
  Farm:       { color: '#16a34a', textColor: '#fff', shape: 'roundrectangle' },
  Farmer:     { color: '#15803d', textColor: '#fff', shape: 'ellipse' },
  Facility:   { color: '#2563eb', textColor: '#fff', shape: 'roundrectangle' },
  Distributor:{ color: '#7c3aed', textColor: '#fff', shape: 'roundrectangle' },
  Retailer:   { color: '#d97706', textColor: '#fff', shape: 'roundrectangle' },
  Product:    { color: '#0891b2', textColor: '#fff', shape: 'ellipse' },
  RetailPack: { color: '#dc2626', textColor: '#fff', shape: 'star' },
  default:    { color: '#6b7280', textColor: '#fff', shape: 'ellipse' },
}

/** Màu edge theo relationship type */
const EDGE_COLORS: Record<string, string> = {
  PRODUCED:       '#16a34a',
  TRANSFORMED_BY: '#0891b2',
  CREATED:        '#0891b2',
  PACKAGED_INTO:  '#dc2626',
  DISTRIBUTED_BY: '#7c3aed',
  SOLD_AT:        '#d97706',
  CERTIFIED_BY:   '#f59e0b',
  default:        '#9ca3af',
}

/** Label ngắn gọn cho Product node */
function productLabel(p: Record<string, unknown>): string {
  const stage = String(p.stage ?? '')
  const stageLabels: Record<string, string> = {
    cherry: '🍒 Quả tươi',
    green: '🌿 Nhân xanh',
    roasted: '☕ Rang',
    packed: '📦 Đóng gói',
    paddy: '🌾 Lúa tươi',
    milled: '🍚 Gạo xát',
    raw: '🥬 Rau tươi',
    washed: '✨ Sơ chế',
  }
  return stageLabels[stage] ?? stage
}

/**
 * Serialize TraceResult → Cytoscape elements array
 * Tự động build edges từ product chain order
 */
export function serializeToCytoscape(trace: TraceResult): CytoElement[] {
  const elements: CytoElement[] = []
  const seen = new Set<string>()

  function addNode(node: TraceNode) {
    if (seen.has(node.id)) return
    seen.add(node.id)
    const style = NODE_STYLE[node.type] ?? NODE_STYLE.default
    elements.push({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        color: style.color,
        textColor: style.textColor,
        shape: style.shape,
        properties: node.properties,
      },
    })
  }

  function addEdge(source: string, target: string, type: string, label: string) {
    const id = `${source}-${type}-${target}`
    if (seen.has(id)) return
    seen.add(id)
    elements.push({
      data: {
        id,
        source,
        target,
        label,
        color: EDGE_COLORS[type] ?? EDGE_COLORS.default,
      },
    })
  }

  // Farms
  trace.farms.forEach(f => addNode({
    id: String(f.id), type: 'Farm', label: String(f.name ?? 'Farm'), properties: f,
  }))

  // Products theo thứ tự stage
  const stageOrder = ['cherry', 'paddy', 'raw', 'green', 'milled', 'washed', 'roasted', 'packed']
  const sortedProducts = [...trace.products].sort((a, b) => {
    const ai = stageOrder.indexOf(String(a.stage ?? ''))
    const bi = stageOrder.indexOf(String(b.stage ?? ''))
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  sortedProducts.forEach(p => addNode({
    id: String(p.id), type: 'Product', label: productLabel(p), properties: p,
  }))

  // Facilities
  trace.facilities.forEach(f => addNode({
    id: String(f.id), type: 'Facility',
    label: String(f.name ?? f.type ?? 'Facility'), properties: f,
  }))

  // RetailPack
  if (trace.pack.id) {
    addNode({
      id: String(trace.pack.id), type: 'RetailPack',
      label: `📦 ${trace.pack.qr_code ?? trace.pack.sku ?? 'Pack'}`, properties: trace.pack,
    })
  }

  // Edges: Farm → first Product
  if (trace.farms[0] && sortedProducts[0]) {
    addEdge(String(trace.farms[0].id), String(sortedProducts[0].id), 'PRODUCED', 'Sản xuất')
  }

  // Edges: Products chain
  for (let i = 0; i < sortedProducts.length - 1; i++) {
    addEdge(
      String(sortedProducts[i].id),
      String(sortedProducts[i + 1].id),
      'TRANSFORMED_BY', 'Chế biến'
    )
  }

  // Edge: last Product → RetailPack
  if (sortedProducts.length > 0 && trace.pack.id) {
    addEdge(
      String(sortedProducts[sortedProducts.length - 1].id),
      String(trace.pack.id),
      'PACKAGED_INTO', 'Đóng gói'
    )
  }

  return elements
}
