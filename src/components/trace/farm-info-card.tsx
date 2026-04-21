/**
 * Card thông tin nông trại (hiển thị trên trang trace)
 */
import { MapPin, User, Package, Award } from 'lucide-react'

interface FarmInfoCardProps {
  farm: Record<string, unknown>
}

export default function FarmInfoCard({ farm }: FarmInfoCardProps) {
  const commodityIcons: Record<string, string> = {
    coffee: '☕', rice: '🌾', vegetable: '🥬',
  }
  const icon = commodityIcons[String(farm.commodity_id ?? '')] ?? '🌿'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-800 text-base">{String(farm.name ?? 'Nông trại')}</h3>
          <p className="text-xs text-gray-500">{String(farm.province ?? '')}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {Boolean(farm.area_ha) && (
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Diện tích: <strong>{String(farm.area_ha)} ha</strong></span>
          </div>
        )}
        {Boolean(farm.lat && farm.lng) && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="font-mono text-xs">
              {Number(farm.lat).toFixed(4)}, {Number(farm.lng).toFixed(4)}
            </span>
          </div>
        )}
        {Boolean(farm.altitude_m) && (
          <div className="flex items-center gap-2 text-gray-600">
            <Award className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>Độ cao: <strong>{String(farm.altitude_m)} m</strong></span>
          </div>
        )}
      </div>

      {/* Map placeholder — Phase sau thêm MapLibre */}
      {Boolean(farm.lat && farm.lng) && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${farm.lat}&mlon=${farm.lng}&zoom=14`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline mt-1"
        >
          <MapPin className="w-3 h-3" />
          Xem trên bản đồ
        </a>
      )}
    </div>
  )
}
