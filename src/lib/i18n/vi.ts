/**
 * Chuỗi giao diện tiếng Việt
 * Tập trung tất cả text UI vào 1 file để dễ maintain
 */
export const vi = {
  app: {
    name: 'Truy Xuất Nguồn Gốc Nông Sản',
    shortName: 'NôngSản QR',
    description: 'Truy xuất nguồn gốc minh bạch từ nông trại đến bàn ăn',
    tagline: 'Từ nông trại đến bàn ăn — minh bạch từng bước',
  },

  nav: {
    home: 'Trang chủ',
    trace: 'Tra cứu',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    dashboard: 'Tổng quan',
    farmer: 'Nông dân',
    facility: 'Cơ sở chế biến',
    distributor: 'Phân phối',
    scanQr: 'Quét QR',
  },

  landing: {
    heroTitle: 'Truy Xuất Nguồn Gốc\nNông Sản Việt Nam',
    heroSubtitle:
      'Quét mã QR để biết hành trình đầy đủ của sản phẩm — từ vườn đến tay bạn',
    scanBtn: 'Quét mã QR',
    searchPlaceholder: 'Nhập mã lô hàng (VD: CFE-DL-2026-001)...',
    searchBtn: 'Tra cứu',
    featuredTitle: 'Mặt hàng nổi bật',
    howItWorksTitle: 'Quy trình truy xuất',
    steps: [
      { icon: '🌱', title: 'Thu hoạch', desc: 'Nông dân ghi nhận lô hàng tại vườn' },
      { icon: '🏭', title: 'Chế biến', desc: 'Cơ sở sơ chế, đóng gói, kiểm định' },
      { icon: '🚚', title: 'Vận chuyển', desc: 'Nhà phân phối nhận và giao hàng' },
      { icon: '📱', title: 'Tra cứu', desc: 'Người tiêu dùng quét QR xem lịch sử' },
    ],
    stats: [
      { value: '3', label: 'Mặt hàng' },
      { value: '100%', label: 'Minh bạch' },
      { value: 'GS1', label: 'Chuẩn quốc tế' },
    ],
  },

  commodities: {
    coffee: {
      id: 'coffee',
      name: 'Cà phê',
      origin: 'Đắk Lắk, Lâm Đồng',
      icon: '☕',
      description: 'Robusta & Arabica — từ vườn đến ly',
      color: 'amber',
      stages: ['Quả tươi', 'Nhân xanh', 'Cà phê rang', 'Đóng gói'],
    },
    rice: {
      id: 'rice',
      name: 'Gạo ST25',
      origin: 'Sóc Trăng, ĐBSCL',
      icon: '🌾',
      description: 'Gạo ngon nhất thế giới — từ ruộng đến nồi',
      color: 'green',
      stages: ['Lúa tươi', 'Gạo xát', 'Đóng bao'],
    },
    vegetable: {
      id: 'vegetable',
      name: 'Rau hữu cơ',
      origin: 'Đà Lạt, Lâm Đồng',
      icon: '🥬',
      description: 'Rau sạch hữu cơ — từ luống rau đến bữa cơm',
      color: 'emerald',
      stages: ['Rau tươi', 'Rau sơ chế', 'Đóng gói'],
    },
  },

  trace: {
    title: 'Kết quả tra cứu',
    notFound: 'Không tìm thấy lô hàng',
    notFoundDesc: 'Mã lô hàng không tồn tại hoặc chưa được cập nhật vào hệ thống.',
    journey: 'Hành trình sản phẩm',
    farm: 'Nông trại',
    farmer: 'Nông dân',
    facility: 'Cơ sở chế biến',
    distributor: 'Nhà phân phối',
    retailer: 'Điểm bán',
    certification: 'Chứng nhận',
    certValid: 'Còn hiệu lực',
    certExpired: 'Hết hạn',
    batchCode: 'Mã lô',
    harvestDate: 'Ngày thu hoạch',
    quantity: 'Sản lượng',
    mapTitle: 'Bản đồ hành trình',
  },

  roles: {
    farmer: 'Nông dân',
    facility: 'Cơ sở chế biến',
    distributor: 'Nhà phân phối / Bán lẻ',
    admin: 'Quản trị viên',
    consumer: 'Người tiêu dùng',
  },

  farmer: {
    title: 'Quản lý nông trại',
    registerFarm: 'Đăng ký vườn mới',
    recordHarvest: 'Ghi nhận thu hoạch',
    myFarms: 'Vườn của tôi',
    harvestHistory: 'Lịch sử thu hoạch',
  },

  facility: {
    title: 'Quản lý cơ sở chế biến',
    receiveShipment: 'Nhận lô hàng',
    recordProcess: 'Ghi nhận chế biến',
    pendingBatches: 'Lô chờ xử lý',
    processedBatches: 'Lô đã xử lý',
  },

  distributor: {
    title: 'Quản lý phân phối',
    receiveGoods: 'Nhận hàng',
    packageRetail: 'Đóng gói & In QR',
    myShipments: 'Lô hàng của tôi',
  },

  dashboard: {
    title: 'Tổng quan hệ thống',
    totalBatches: 'Tổng lô hàng',
    activeBatches: 'Đang lưu thông',
    farmCount: 'Nông trại',
    certExpiringSoon: 'Chứng nhận sắp hết hạn',
    recentActivity: 'Hoạt động gần đây',
  },

  common: {
    loading: 'Đang tải...',
    error: 'Đã có lỗi xảy ra',
    retry: 'Thử lại',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    delete: 'Xóa',
    edit: 'Sửa',
    view: 'Xem',
    back: 'Quay lại',
    next: 'Tiếp theo',
    submit: 'Gửi',
    success: 'Thành công',
    noData: 'Chưa có dữ liệu',
    kg: 'kg',
    date: 'Ngày',
    status: 'Trạng thái',
    actions: 'Thao tác',
  },
} as const;

export type Vi = typeof vi;
