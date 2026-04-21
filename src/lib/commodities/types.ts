/**
 * Kiểu dữ liệu cho cấu hình commodity (mặt hàng nông sản)
 * Mỗi commodity định nghĩa stages, processes, certifications riêng
 * → Thêm commodity mới = tạo 1 file config, không sửa core code
 */

/** Định nghĩa 1 stage (giai đoạn) của mặt hàng */
export interface CommodityStage {
  id: string           // VD: 'cherry', 'green', 'roasted'
  label: string        // VD: 'Quả tươi', 'Nhân xanh'
  fields: string[]     // Các trường dữ liệu đặc thù (lưu vào attributes JSON)
}

/** Định nghĩa 1 bước chế biến (process) */
export interface CommodityProcess {
  id: string           // VD: 'harvest', 'wash', 'roast'
  label: string        // VD: 'Thu hoạch', 'Sơ chế', 'Rang'
  from: string | null  // Stage đầu vào (null = thu hoạch từ farm)
  to: string           // Stage đầu ra
  performer: 'farmer' | 'facility' | 'distributor'
}

/** Cấu hình đầy đủ của 1 mặt hàng */
export interface CommodityConfig {
  id: string           // 'coffee' | 'rice' | 'vegetable'
  name: string         // 'Cà phê'
  icon: string         // '☕'
  description: string
  origin: string       // Vùng trồng điển hình
  color: string        // Tailwind color name
  stages: CommodityStage[]
  processes: CommodityProcess[]
  certifications: string[]  // Các chứng nhận áp dụng
}
