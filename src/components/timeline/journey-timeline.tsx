/**
 * Timeline hiển thị hành trình sản phẩm theo thứ tự thời gian
 * Nhận vào danh sách products (sorted by stage order)
 */
import { vi } from '@/lib/i18n/vi'

interface TimelineStep {
  stage: string
  label: string
  date?: string
  location?: string
  icon: string
  done: boolean
}

interface JourneyTimelineProps {
  products: Record<string, unknown>[]
  commodityId: string
}

const STAGE_ICONS: Record<string, string> = {
  cherry: '🍒', green: '🌿', roasted: '☕', packed: '📦',
  paddy: '🌾', milled: '🍚',
  raw: '🥬', washed: '✨',
  default: '📋',
}

const STAGE_LABELS_VN: Record<string, string> = {
  cherry: 'Thu hoạch quả tươi',
  green: 'Sơ chế nhân xanh',
  roasted: 'Rang cà phê',
  packed: 'Đóng gói & phân phối',
  paddy: 'Thu hoạch lúa',
  milled: 'Xay xát gạo',
  raw: 'Thu hoạch rau',
  washed: 'Sơ chế & đóng gói',
}

const STAGE_ORDER = ['cherry', 'paddy', 'raw', 'green', 'milled', 'washed', 'roasted', 'packed']

function parseAttributes(attrs: unknown): Record<string, string> {
  if (!attrs) return {}
  try {
    return JSON.parse(String(attrs))
  } catch {
    return {}
  }
}

export default function JourneyTimeline({ products }: JourneyTimelineProps) {
  const sorted = [...products].sort((a, b) => {
    const ai = STAGE_ORDER.indexOf(String(a.stage ?? ''))
    const bi = STAGE_ORDER.indexOf(String(b.stage ?? ''))
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const steps: TimelineStep[] = sorted.map((p) => {
    const attrs = parseAttributes(p.attributes)
    const stage = String(p.stage ?? '')
    return {
      stage,
      label: STAGE_LABELS_VN[stage] ?? stage,
      date: attrs.harvest_date ?? attrs.milling_date ?? attrs.roast_date ?? attrs.packaged_date ?? attrs.wash_date,
      location: undefined,
      icon: STAGE_ICONS[stage] ?? STAGE_ICONS.default,
      done: true,
    }
  })

  if (steps.length === 0) {
    return <p className="text-sm text-gray-400">{vi.common.noData}</p>
  }

  return (
    <ol className="relative border-l-2 border-green-200 ml-4 space-y-6">
      {steps.map((step, i) => (
        <li key={i} className="ml-6">
          {/* Dot */}
          <span className="absolute -left-[17px] flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 text-base">
            {step.icon}
          </span>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="font-semibold text-gray-800 text-sm">{step.label}</p>
            {step.date && (
              <p className="text-xs text-gray-500 mt-0.5">
                📅 {step.date}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{String(step.stage).toUpperCase()}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
