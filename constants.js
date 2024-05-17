module.exports = {
  ROWS_PER_PAGE: 20,          // Số lượng phần tử/trang
  RENTAL_TYPE_DAY: 'D',       // Hình thức thuê theo ngày
  RENTAL_TYPE_MONTH: 'M',     // Hình thức thuê theo tháng
  RENTAL_TYPE_ALL: 'A',       // Cả 2 hình thức trên

  VEHICLE_TYPE_CAR: 'C',      // Loại xe ô tô
  VEHICLE_TYPE_MOTOR: 'M',    // Loại xe máy
  VEHICLE_TYPE_ELECTRIC: 'E', // Loại xe điện

  BOOKING_SERVICE_RENTAL_CAR: 'TL',     // Tự lái
  BOOKING_SERVICE_RENTAL_DRIVER: 'CL',  // Có lái

  FUEL_GAS: 'G',               // Xe nhiên liệu xăng
  FUEL_OIL: 'O',               // Xe nhiên liệu dầu
  FUEL_ELECTRIC: 'E',          // Xe điện

  HOLIDAY_EVENT_NATIONAL: 'national',   // Quốc Khánh
  HOLIDAY_EVENT_HUNGKING: 'hungking',   // Giỗ tổ Hùng Vương
  HOLIDAY_EVENT_LIBERATION: 'liberation', // 30/04-01/05
  HOLIDAY_EVENT_NEWYEAR: 'newyear',    // Tết Dương lịch
  HOLIDAY_EVENT_LUNAR: 'lunar',      // Tết Âm lịch

  VEHICLE_CLASS_A: 'A',               // Xe hạng A
  VEHICLE_CLASS_B: 'B',               // Xe hạng B
  VEHICLE_CLASS_C: 'C',               // Xe hạng C
  VEHICLE_CLASS_MPV: 'MPV',           // Xe 7 chỗ đa dụng
  VEHICLE_CLASS_PICKUP: 'PICKUP',     // Xe bán tải
  VEHICLE_CLASS_MINISUV: 'MiniSUV',   // Xe SUV đô thị cỡ nhỏ
  VEHICLE_CLASS_CUV: 'CUV',           // Xe 5 chỗ gầm cao hạng trung
  VEHICLE_CLASS_SUV: 'SUV',           // Xe 7 chỗ thể thao
  VEHICLE_CLASS_LUXURY: 'LUXURY',     // Xe sang


  // Các loại truyền động
  TRANMISSION_TYPE_MANUAL: 'M',  // Số sàn 
  TRANMISSION_TYPE_AUTO: 'A',    // Số tự động

  // Các góc chụp xe ô tô
  CAR_IMAGE_FRONT: 'car_front',          // Góc chụp xe phía trước
  CAR_IMAGE_BACK: 'car_back',           // Góc chụp xe phía sau
  CAR_IMAGE_LEFT: 'car_left',           // Góc chụp xe bên trái
  CAR_IMAGE_RIGHT: 'car_right',          // Góc chụp xe bên phải
  CAR_IMAGE_INTERIOR: 'car_interior',         // Góc chụp nội thất
  CAR_IMAGE_FUEL: 'fuel_gauge',           // Góc chụp đồng hồ
  CAR_VIDEO: 'car_video',                 // Video

  // Các loại ảnh chụp giấy tờ của KH
  CUSTOMER_IMAGE_IDENTITY_FRONT: 'identity_front',
  CUSTOMER_IMAGE_IDENTITY_BACK: 'identity_back',
  CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT: 'driver_licence_front',
  CUSTOMER_IMAGE_DRIVER_LICENCE_BACK: 'driver_licence_back',
  CUSTOMER_IMAGE_HOUSE_HOLD: 'house_hold',
  CUSTOMER_IMAGE_OTHER_PAPER: 'other_paper',
  CUSTOMER_IMAGE_ASSET_DEPOSIT: 'asset_deposit',

  // Các loại giấy tờ, tài sản đặt cọc
  DEPOSIT_IDENTITY_PAPER: 'identity_paper',
  DEPOSIT_IDENTITY_PAPER_NOTE: 'identity_paper_note',
  DEPOSIT_MOTOR: 'motor',
  DEPOSIT_MOTOR_REGISTRATION: 'motor_registration',
  DEPOSIT_CASH: 'cash',
  DEPOSIT_OTHER: 'other',

  // Các hình thức nhận xe
  RECEIVE_TYPE_GARA: 'gara',      // NHận xe tại gara
  RECEIVE_TYPE_HOME: 'home',      // Nhận xe tại nhà
  RECEIVE_TYPE_ADDRESS: 'address',  // Nhận xe tại địa chỉ

  // Các thủ tục thuê xe
  PROCEDURE_IDENTITY: 'identity',
  PROCEDURE_HOUSEHOLD: 'household',
  PROCEDURE_DRIVER_LICENCE: 'driver_licence',
  PROCEDURE_DEPOSIT: 'deposit',
  PROCEDURE_LABOR_CONTRACT: 'labor_contract',
  PROCEDURE_OTHER: 'other',

  // Các loại thủ tục
  PROCEDURE_TYPE_HOLD: 'hold',    // Giữ lại
  PROCEDURE_TYPE_VERIFY: 'verify',// Xác minh (k giữ lại)

  // Các loại phí phát sinh
  OTHER_COST_OVERTIME: 'overtime',// Phí vượt quá thời gian trả xe
  OTHER_COST_OVERKM: 'overkm',    // Phí vượt quá giới hạn km
  OTHER_COST_FUEL: 'fuel',        // Phụ phí nhiên liệu
  OTHER_COST_TOLLS: 'tolls',      // Phí cầu đường
  OTHER_COST_REPAIR: 'repair',                  // Chi phí khắc phục xe
  OTHER_COST_OVERSPEED: 'overspeed',            // Vượt tốc độ
  OTHER_COST_FORBIDDEN_ROAD: 'forbidden_road',  // Đi vào đường cấm
  OTHER_COST_RED_LIGHT: 'red_light',            // Vượt đèn đỏ
  OTHER_COST_VIOLATION_OTHER: 'violation_other',// Lỗi vi phạm khác

  // Giới tính
  GENDER_MALE: 'M',               // Name
  GENDER_FEMALE: 'F',             // Nữ

  // Các loại hợp đồng, biên bản
  BOOKING_CUSTOMER_CONTRACT: 'customer_contract', // Hợp đồng thuê xe với khách hàng
  BOOKING_RECEIVE_REPORT: 'receive_report',       // Biên bản giao nhận xe
  OWNER_CONTRACT: 'owner_contract',               // Hợp đồng thuê xe với chủ xe
  OWNER_DELIVERY_REPORT: 'delivery_report',        // Biên bản giao nhận xe với chủ xe

  // Trạng thái thẩm định
  APPROVE_STATUS_PENDING: 0,
  APPROVE_STATUS_PASSED: 1,
  APPROVE_STATUS_FAILED: 2,

  // Các loại giấy tờ, tài sản đặt cọc
  DEPOSIT_PAPER_IDENTITY: 'identity',
  DEPOSIT_PAPER_HOUSEHOLD: 'house_hold',
  DEPOSIT_PAPER_PASSPORT: 'passport',
  DEPOSIT_PAPER_OTHER: 'paper_other',
  DEPOSIT_ASSET_MOTOR: 'motor',
  DEPOSIT_ASSET_MOTOR_REGISTRATION: 'motor_registration',
  DEPOSIT_ASSET_CASH: 'cash',
  DEPOSIT_ASSET_OTHER: 'asset_other',

  // Dịch vụ add-on
  ADDON_DRIVER: 'addon_driver',                       // Thuê thêm lái xe
  ADDON_INSURANCE: 'addon_insurance',                 // Bảo hiểm chuyến đi
  ADDON_FREE_PROCEDURE: 'addon_free_procedure',       // Miễn giảm thủ tục 
  ADDON_KID_CHAIR: 'addon_kid_chair',                 // Ghế trẻ em
  ADDON_WATER: 'addon_water',                         // Nước uống
  ADDON_SPEAKER_PULL: 'addon_speaker_pull',           // Loa kéo
  ADDON_CAMP: 'addon_camp',                           // Lều cắm trại
  ADDON_SCOOTER: 'addon_scooter',                     // Xe đạp/ e-Scooter gấp 
  ADDON_4G: 'addon_4g',                               // Bộ phát wifi 4G

  // Booking status
  BOOKING_STATUS_PENDING: 10,   // Chờ xử lý
  BOOKING_STATUS_PREPAID: 20,   // Đã cọc
  BOOKING_STATUS_APPROVED: 30,  // Đã thẩm định
  BOOKING_STATUS_RECEIVED: 40,  // Đã giao xe
  BOOKING_STATUS_RUNNING: 50,   // Đang đi
  BOOKING_STATUS_RETURNED: 60,  // Đã trả xe
  BOOKING_STATUS_CANCELED: 70,  // Hủy
  BOOKING_STATUS_REFUND: 80,    // Hoàn cọc

  CUSTOMER_VERIFY_STATUS_PENDING: 0,
  CUSTOMER_VERIFY_STATUS_VERIFIED: 10,

  CUSTOMER_PROFILE_STATUS_UNCOMPLETED: 0,   // Chưa hoàn thiện hồ sơ
  CUSTOMER_PROFILE_STATUS_COMPLETED: 10,    // Hoàn thiện hồ sơ
  CUSTOMER_PROFILE_STATUS_BLACKLIST: 20,    // Blacklist

  CAR_DOCUMENT_REGISTRATION: 'registration_document',
  CAR_DOCUMENT_REGISTRATION_CERT: 'registration_certificate',
  CAR_DOCUMENT_LIABILITY_CERT: 'liability_insurance_certificate',
  CAR_DOCUMENT_PHYSICAL_CERT: 'physical_insurance_certificate',
  CAR_DOCUMENT_OTHER: 'other_document',

  PAYMENT_METHOD_ONLINE: 'online',
  PAYMENT_METHOD_MOMO: 'online-momo',
  PAYMENT_METHOD_VNPAY: 'online-vnpay',
  PAYMENT_METHOD_BANK: 'online-bank',
  PAYMENT_METHOD_CASH: 'cash',

  OPERATION_COST_ETC_DEPOSIT: 'ect_deposit',
  OPERATION_COST_WASH: 'wash',
  OPERATION_COST_MOTOR_PARKING: 'motor_parking',
  OPERATION_COST_MOVING: 'moving_fee',
  OPERATION_COST_FUEL_DEPOSIT: 'fuel_deposit',
  OPERATION_COST_COMMISSION: 'commisison',
  OPERATION_COST_CAR_PARKING: 'car_parking',
  OPERATION_COST_REPAIR: 'repair',

  DELIVERY_STATUS_PENDING: 'pending', // Chưa giao
  DELIVERY_STATUS_RECEIVED: 'received', // Đã giao
  DELIVERY_STATUS_RETURNED: 'returned', // Đã trả
  DELIVERY_STATUS_CANCELED: 'canceled', // Đã hủy

  SCHEDULE_DATE_TYPE_RECEIVE: 'receive',
  SCHEDULE_DATE_TYPE_RETURN: 'return',

  // Trạng thái đặt
  BOOKED_STATUS_HOLD: 'hold', // Đặt lịch trước
  BOOKED_STATUS_DEPOSIT: 'deposit', // Đặt cọc
  BOOKED_STATUS_PAID100: 'paid', // Thanh toán 100%

  // Loại công việc giao nhận
  TASK_TYPE_RECEIVE: 'receive',
  TASK_TYPE_RETURN: 'return',

  // Trạng thái công việc giao nhận
  TASK_STATUS_PENDING: 'pending',
  TASK_STATUS_DONE: 'done',
  TASK_STATUS_CANCELED: 'canceled',

  // Kiểu đối soát
  RECONCILIATION_EARLY: 'early',    // Đầu tháng
  RECONCILIATION_MIDDLE: 'middle',  // 15 hàng tháng
  RECONCILIATION_LATE: 'late',      // Cuối tháng
  RECONCILIATION_PPT: 'ppt',        // Thanh toán sau giao dịch

  DEPOSIT_DEFAULT: {
    identity_paper: "",
    identity_paper_note: "",
    identity_paper_returned: false,
    motor: "",
    motor_returned: false,
    motor_registration: "",
    motor_registration_returned: false,
    cash: 0,
    cash_returned: false,
    other: "",
    other_returned: true
  },

  VAT_DEFAULT: {
    company_name: "",
    company_tax: "",
    company_address: "",
    company_email: ""
  }
}
