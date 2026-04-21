/**
 * Dropdown chọn commodity — dùng trong tất cả ingest forms
 */
import { getAllCommodities } from '@/lib/commodities/registry'

interface CommoditySelectorProps {
  name?: string
  defaultValue?: string
  required?: boolean
  className?: string
}

export default function CommoditySelector({
  name = 'commodityId',
  defaultValue = 'coffee',
  required = true,
  className = '',
}: CommoditySelectorProps) {
  const commodities = getAllCommodities()

  return (
    <select
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white ${className}`}
    >
      {commodities.map(c => (
        <option key={c.id} value={c.id}>
          {c.icon} {c.name} — {c.origin}
        </option>
      ))}
    </select>
  )
}
