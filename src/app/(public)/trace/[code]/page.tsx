import { traceByQr } from '@/lib/graph/queries'
import { serializeToCytoscape } from '@/lib/graph/serialize'
import { COMMODITY_REGISTRY } from '@/lib/commodities/registry'
import { vi } from '@/lib/i18n/vi'
import CertBadge from '@/components/trace/cert-badge'
import FarmInfoCard from '@/components/trace/farm-info-card'
import JourneyTimeline from '@/components/timeline/journey-timeline'
import GraphWrapper from '@/components/graph/graph-wrapper'
import Link from 'next/link'
import { ArrowLeft, Package, Search } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  return { title: `Tra cứu: ${code}` }
}

export default async function TraceCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  // Query Neo4j
  const trace = await traceByQr(code)

  // Không tìm thấy
  if (!trace.found) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">{vi.trace.notFound}</h1>
        <p className="text-gray-500 text-sm mb-2">{vi.trace.notFoundDesc}</p>
        <p className="font-mono text-xs bg-gray-100 inline-block px-3 py-1 rounded-lg text-gray-600 mb-6">{code}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/trace" className="inline-flex items-center gap-2 text-sm text-green-700 font-medium hover:underline">
            <Search className="w-4 h-4" /> Tra cứu mã khác
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
        </div>
      </div>
    )
  }

  // Serialize cho Cytoscape
  const cytoElements = serializeToCytoscape(trace)

  // Lấy commodity info
  const commodity = trace.pack.commodity_id
    ? COMMODITY_REGISTRY[String(trace.pack.commodity_id)]
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/trace" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Tra cứu
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{commodity?.icon ?? '🌿'}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {commodity?.name ?? 'Nông sản'}
              </h1>
              <p className="font-mono text-sm text-gray-500 mt-0.5">{code}</p>
            </div>
          </div>
        </div>
        {/* Pack info */}
        <div className="text-right text-sm text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <Package className="w-4 h-4" />
            <span className="font-medium text-gray-700">{String(trace.pack.sku ?? '')}</span>
          </div>
          {Boolean(trace.pack.packaged_date) && (
            <p className="text-xs mt-1">📅 Đóng gói: {String(trace.pack.packaged_date)}</p>
          )}
          {Boolean(trace.pack.expiry_date) && (
            <p className="text-xs mt-0.5">⏰ Hết hạn: {String(trace.pack.expiry_date)}</p>
          )}
        </div>
      </div>

      {/* Main layout: Graph + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Graph — chiếm 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-700">{vi.trace.journey}</h2>
          <GraphWrapper elements={cytoElements} height={420} />

          {/* Timeline */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="font-semibold text-gray-700 mb-5 text-sm">📋 Các bước trong chuỗi</h3>
            <JourneyTimeline
              products={trace.products}
              commodityId={String(trace.pack.commodity_id ?? '')}
            />
          </div>
        </div>

        {/* Sidebar: Farm + Certs */}
        <div className="space-y-4">
          {/* Farm info */}
          {trace.farms.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">{vi.trace.farm}</h3>
              <FarmInfoCard farm={trace.farms[0]} />
            </div>
          )}

          {/* Certifications */}
          {trace.certifications.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">{vi.trace.certification}</h3>
              <div className="space-y-2">
                {trace.certifications.map((cert, i) => (
                  <CertBadge
                    key={i}
                    standard={String(cert.standard ?? '')}
                    issuer={cert.issuer ? String(cert.issuer) : undefined}
                    expiresDate={cert.expires_date ? String(cert.expires_date) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {trace.facilities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">{vi.trace.facility}</h3>
              <div className="space-y-2">
                {trace.facilities.map((f, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm">
                    <p className="font-medium text-gray-800">{String(f.name ?? '')}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{String(f.type ?? '')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standards badge */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-2">🏷️ Chuẩn truy xuất</p>
            <p>GS1 EPCIS 2.0</p>
            <p>FDA FSMA 204</p>
            <p>EUDR Compliant</p>
          </div>
        </div>
      </div>
    </div>
  )
}
