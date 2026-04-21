/**
 * Render các input fields động từ CommodityStage.fields array
 * Mỗi field key → tự suy ra type (date, number, text) để render đúng input
 */
interface DynamicFieldsProps {
  fields: string[]    // VD: ['variety', 'weight_kg', 'harvest_date']
  prefix?: string     // Prefix cho name attribute
}

/** Suy ra kiểu input từ tên field */
function inferInputType(field: string): { type: string; placeholder: string } {
  if (field.includes('date')) return { type: 'date', placeholder: 'YYYY-MM-DD' }
  if (field.includes('_kg') || field.includes('_g') || field.includes('_pct') ||
      field.includes('_m') || field.includes('_score') || field.includes('_size') ||
      field.includes('_pct') || field.includes('ha'))
    return { type: 'number', placeholder: '0' }
  return { type: 'text', placeholder: '' }
}

/** Label tiếng Việt từ field key */
function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    variety: 'Giống', weight_kg: 'Khối lượng (kg)', weight_g: 'Khối lượng (g)',
    harvest_date: 'Ngày thu hoạch', altitude_m: 'Độ cao (m)', moisture_pct: 'Độ ẩm (%)',
    cupping_score: 'Điểm cupping', screen_size: 'Kích thước nhân',
    process_method: 'Phương pháp chế biến', roast_profile: 'Profile rang',
    roast_date: 'Ngày rang', roast_level: 'Mức độ rang', weight_loss_pct: 'Hao hụt (%)',
    packaged_date: 'Ngày đóng gói', expiry_date: 'Hạn sử dụng',
    grind_type: 'Loại xay', bag_type: 'Loại bao',
    polish_grade: 'Cấp đánh bóng', broken_pct: 'Tỷ lệ gạo gãy (%)',
    head_rice_pct: 'Tỷ lệ gạo nguyên (%)', milling_date: 'Ngày xay xát',
    field_id: 'Mã luống rau', wash_method: 'Phương pháp rửa',
    wash_date: 'Ngày sơ chế', weight_after_kg: 'Khối lượng sau sơ chế (kg)',
  }
  return labels[field] ?? field.replace(/_/g, ' ')
}

export default function DynamicFields({ fields, prefix = 'attr_' }: DynamicFieldsProps) {
  return (
    <>
      {fields.map(field => {
        const { type, placeholder } = inferInputType(field)
        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {fieldLabel(field)}
            </label>
            <input
              type={type}
              name={`${prefix}${field}`}
              placeholder={placeholder}
              step={type === 'number' ? 'any' : undefined}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        )
      })}
    </>
  )
}
