'use strict';

const constants = require("../constants");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('system_config')
    await queryInterface.bulkInsert('system_config', [
      {
        code: 'procedure_data', name: 'Thủ tục cho thuê xe', value: JSON.stringify(
          [
            {
              name: "CMND",
              code: constants.PROCEDURE_IDENTITY
            },
            {
              name: "Sổ hộ khẩu",
              code: constants.PROCEDURE_HOUSEHOLD
            },
            {
              name: "Bằng lái",
              code: constants.PROCEDURE_DRIVER_LICENCE
            },
            {
              name: "Đặt cọc",
              code: constants.PROCEDURE_DEPOSIT
            },
            {
              name: "Hợp đồng lao động",
              code: constants.PROCEDURE_LABOR_CONTRACT
            },
            {
              name: "Giấy tờ khác",
              code: constants.PROCEDURE_OTHER
            }
          ]
        ), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'procedure_type', name: 'Loại thủ tục cho thuê xe', value: JSON.stringify([
          {
            code: 'hold',
            name: "Thế chấp",
            description: "Giữ lại"
          },
          {
            code: 'verify',
            name: "Xác minh",
            description: "Không giữ lại"
          }
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'holiday_event',
        name: 'Sự kiện ngày lễ',
        value: JSON.stringify([
          {
            name: "Quốc Khánh 02/09",
            code: constants.HOLIDAY_EVENT_NATIONAL,
            from_date: "02/09",
            to_date: "02/095"
          },
          {
            name: "Giỗ tổ Hùng Vương",
            code: constants.HOLIDAY_EVENT_HUNGKING,
            from_date: "10/03",
            to_date: "10/03"
          },
          {
            name: "Giải phóng miền Nam 30/4 và QTLĐ 01/05",
            code: constants.HOLIDAY_EVENT_LIBERATION,
            from_date: "30/04",
            to_date: "01/05"
          },
          {
            name: "Tết Dương lịch",
            code: constants.HOLIDAY_EVENT_NEWYEAR,
            from_date: "30/12",
            to_date: "01/01"
          },
          {
            name: "Tết Âm lịch",
            code: constants.HOLIDAY_EVENT_LUNAR,
            from_date: "30/04",
            to_date: "01/05"
          }
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'car_style',
        name: 'Kiểu dáng xe',
        value: JSON.stringify([
          {
            code: 'Sedan',
            name: 'Sedan',
          },
          {
            code: 'MVP',
            name: 'MVP',
          },
          {
            code: 'SUV/CUV',
            name: 'SUV/CUV',
          },
          {
            code: 'MiniVan/Van',
            name: 'MiniVan/Van',
          },
          {
            code: 'Hatchback',
            name: 'Hatchback',
          },
          {
            code: 'Pickup',
            name: 'Pickup',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'vehicle_class',
        name: 'Hạng xe',
        value: JSON.stringify([
          {
            code: constants.VEHICLE_CLASS_A,
            name: 'Hạng A (Xe 4 chỗ cỡ nhỏ)',
          },
          {
            code: constants.VEHICLE_CLASS_B,
            name: 'Hạng B (Xe 5 chỗ gầm thấp)',
          },
          {
            code: constants.VEHICLE_CLASS_C,
            name: 'Hạng C (Xe 5 chỗ gầm thấp)',
          },
          {
            code: constants.VEHICLE_CLASS_MPV,
            name: 'Xe 7 chỗ đa dụng (MPV)',
          },
          {
            code: constants.VEHICLE_CLASS_PICKUP,
            name: 'Xe bán tải (Pick-up)',
          },
          {
            code: constants.VEHICLE_CLASS_MINISUV,
            name: 'Xe SUV đô thị cỡ nhỏ (MiniSUV)',
          },
          {
            code: constants.VEHICLE_CLASS_CUV,
            name: 'Xe 5 chỗ gầm cao hạng trung (CUV)',
          },
          {
            code: constants.VEHICLE_CLASS_SUV,
            name: 'Xe 7 chỗ thể thao (SUV)',
          },
          {
            code: constants.VEHICLE_CLASS_LUXURY,
            name: 'Xe sang (Luxury)',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'transmission',
        name: 'Truyền động',
        value: JSON.stringify([
          {
            code: constants.TRANMISSION_TYPE_MANUAL,
            name: 'Số sàn'
          },
          {
            code: constants.TRANMISSION_TYPE_AUTO,
            name: 'Số tự động'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'fuel',
        name: 'Nhiên liệu xe',
        value: JSON.stringify([
          {
            code: constants.FUEL_GAS,
            name: 'Xăng'
          },
          {
            code: constants.FUEL_OIL,
            name: 'Dầu'
          },
          {
            code: constants.FUEL_ELECTRIC,
            name: 'Điện'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'vehicle_type',
        name: 'Loại xe',
        value: JSON.stringify([
          {
            code: constants.VEHICLE_TYPE_CAR,
            name: 'Ô tô'
          },
          {
            code: constants.VEHICLE_TYPE_MOTOR,
            name: 'Xe máy'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'rental_type',
        name: 'Hình thức thuê',
        value: JSON.stringify([
          {
            code: constants.RENTAL_TYPE_DAY,
            name: 'Thuê theo ngày'
          },
          {
            code: constants.RENTAL_TYPE_MONTH,
            name: 'Thuê theo tháng'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'customer_image',
        name: 'Các loại giấy tờ của khách hàng',
        value: JSON.stringify([
          {
            code: constants.CUSTOMER_IMAGE_IDENTITY_FRONT,
            name: 'CMND/CCCD/Hộ chiếu mặt trước'
          },
          {
            code: constants.CUSTOMER_IMAGE_IDENTITY_BACK,
            name: 'CMND/CCCD/Hộ chiếu mặt sau'
          },
          {
            code: constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT,
            name: 'Bằng lái mặt trước'
          },
          {
            code: constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK,
            name: 'Bằng lái mặt sau'
          },
          {
            code: constants.CUSTOMER_IMAGE_HOUSE_HOLD,
            name: 'Hộ khẩu'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'car_image',
        name: 'Các ảnh chụp của xe ô tô',
        value: JSON.stringify([
          {
            code: constants.CAR_IMAGE_FRONT,
            name: 'Góc chụp mặt trước xe'
          },
          {
            code: constants.CAR_IMAGE_BACK,
            name: 'Góc chụp mặt sau xe'
          },
          {
            code: constants.CAR_IMAGE_RIGHT,
            name: 'Góc chụp bên phải xe'
          },
          {
            code: constants.CAR_IMAGE_LEFT,
            name: 'Góc chụp bên trái xe'
          },
          {
            code: constants.CAR_IMAGE_INTERIOR,
            name: 'Ảnh nội thất'
          },
          {
            code: constants.CAR_IMAGE_FUEL,
            name: 'Ảnh đồng hồ'
          },
          {
            code: constants.CAR_VIDEO,
            name: 'Video xe'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'deposit',
        name: 'Các giấy tờ, tài sản đặt cọc',
        value: JSON.stringify([
          {
            code: constants.DEPOSIT_MOTOR,
            name: 'Xe máy',
          },
          {
            code: constants.DEPOSIT_MOTOR_REGISTRATION,
            name: 'Đăng ký xe máy',
          },
          {
            code: constants.DEPOSIT_CASH,
            name: 'Tiền mặt',
          },
          {
            code: constants.DEPOSIT_OTHER,
            name: 'Tài sản khác',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'other_costs',
        name: 'Các loại phí phụ trội',
        value: JSON.stringify([
          {
            code: constants.OTHER_COST_OVERKM,
            name: 'Vượt quá số km giới hạn',
          },
          {
            code: constants.OTHER_COST_OVERTIME,
            name: 'Quá thời gian trả xe',
          },
          {
            code: constants.OTHER_COST_FUEL,
            name: 'Phụ phí nhiên liệu',
          },
          {
            code: constants.OTHER_COST_TOLLS,
            name: 'Phí cầu đường chưa thành toán',
          },
          {
            code: constants.OTHER_COST_REPAIR,
            name: 'Chi phí khắc phục xe',
          },
          {
            code: constants.OTHER_COST_OVERSPEED,
            name: 'Vượt tốc độ',
          },
          {
            code: constants.OTHER_COST_FORBIDDEN_ROAD,
            name: 'Đi vào đường cấm',
          },
          {
            code: constants.OTHER_COST_RED_LIGHT,
            name: 'Vượt đèn đỏ',
          },
          {
            code: constants.OTHER_COST_VIOLATION_OTHER,
            name: 'Lỗi vi phạm khác',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'receive_type',
        name: 'Hình thức nhận xe',
        value: JSON.stringify([
          {
            code: constants.RECEIVE_TYPE_GARA,
            name: "Nhận xe tại chi nhánh Vshare",
          },
          {
            code: constants.RECEIVE_TYPE_HOME,
            name: 'Nhận xe tại nhà',
          },
          {
            code: constants.RECEIVE_TYPE_ADDRESS,
            name: 'Nhận xe tại địa chỉ',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'level',
        name: 'Trạng thái booking',
        value: JSON.stringify([
          {
            code: 'C3',
            name: 'C3: Để lại thông tin liên lạc  (SĐT, email, nick fb/zalo)',
          },
          {
            code: 'L1',
            name: 'L1: Contact liên lạc đc (loại bỏ số trùng, số ko liên lạc đc) và có nhu cầu',
          },
          {
            code: 'L2',
            name: 'L2: K/h có đủ điều kiện thuê xe: có bằng lái, có giấy tờ và tài sản đặt cọc',
          },
          {
            code: 'L3',
            name: 'L3: K/h đã gửi bản mềm giấy tờ (CCCD/ Bằng lái)',
          },
          {
            code: 'L4',
            name: 'L4: Vshare có xe phù hợp với nhu cầu khách hàng',
          },
          {
            code: 'L5',
            name: 'L5: K/h đã đặt cọc giữ xe cho Vshare (tối thiểu 30%)',
          },
          {
            code: 'L6',
            name: 'L6: K/h đã được Vshare thẩm định (Pass)',
          },
          {
            code: 'L7',
            name: 'L7: Đã lên đơn và gửi cho khách',
          },
          {
            code: 'L8',
            name: 'L8: Khách đã đến nhận xe (ký hợp đồng thuê xe)',
          },
          {
            code: 'L9',
            name: 'L9: Khách trả xe và kết thúc hợp đồng',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'gender',
        name: 'Giới tính',
        value: JSON.stringify([
          {
            code: 'M',
            name: 'Nam',
          },
          {
            code: 'F',
            name: 'Nữ',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'source',
        name: 'Nguồn',
        value: JSON.stringify([
          {
            code: 'web',
            name: 'Web',
          },
          {
            code: 'app',
            name: 'App',
          },
          {
            code: 'mkt',
            name: 'Marketing',
          },
          {
            code: 'sale',
            name: 'Sale',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'approve_status',
        name: 'Trạng thái thẩm định',
        value: JSON.stringify([
          {
            code: constants.APPROVE_STATUS_PENDING,
            name: 'Chưa thẩm định',
          },
          {
            code: constants.APPROVE_STATUS_PASSED,
            name: 'Đạt',
          },
          {
            code: constants.APPROVE_STATUS_FAILED,
            name: 'Không đạt',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'deposit_asset',
        name: 'Tài sản đặt cọc',
        value: JSON.stringify([
          {
            code: constants.DEPOSIT_ASSET_MOTOR,
            name: 'Xe máy',
          },
          {
            code: constants.DEPOSIT_ASSET_MOTOR_REGISTRATION,
            name: 'Xe máy và đăng ký xe',
          },
          {
            code: constants.DEPOSIT_ASSET_CASH,
            name: 'Tiền mặt',
          },
          {
            code: constants.DEPOSIT_ASSET_OTHER,
            name: 'Tài sản khác',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'deposit_paper',
        name: 'Giấy tờ đặt cọc',
        value: JSON.stringify([
          {
            code: constants.DEPOSIT_PAPER_IDENTITY,
            name: 'CCCD/CMND',
          },
          {
            code: constants.DEPOSIT_PAPER_HOUSEHOLD,
            name: 'Hộ khẩu/Thường trú',
          },
          {
            code: constants.DEPOSIT_PAPER_PASSPORT,
            name: 'Hộ chiếu',
          },
          {
            code: constants.DEPOSIT_PAPER_OTHER,
            name: 'Giấy tờ khác',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'add_ons',
        name: 'Dịch vụ add-on',
        value: JSON.stringify([
          {
            code: constants.ADDON_DRIVER,
            name: 'Thuê thêm lái xe',
          },
          {
            code: constants.ADDON_INSURANCE,
            name: 'Bảo hiểm chuyến đi',
          },
          {
            code: constants.ADDON_FREE_PROCEDURE,
            name: 'Miễn giảm thủ tục',
          },
          {
            code: constants.ADDON_KID_CHAIR,
            name: 'Ghế trẻ em',
          },
          {
            code: constants.ADDON_WATER,
            name: 'Nước uống',
          },
          {
            code: constants.ADDON_SPEAKER_PULL,
            name: 'Loa kéo',
          },
          {
            code: constants.ADDON_CAMP,
            name: 'Lều cắm trại',
          },
          {
            code: constants.ADDON_SCOOTER,
            name: 'Xe đạp/ e-Scooter gấp',
          },
          {
            code: constants.ADDON_4G,
            name: 'Bộ phát wifi 4G',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'booking_status',
        name: 'Trạng thái đơn hàng',
        value: JSON.stringify([
          {
            code: constants.BOOKING_STATUS_PENDING.toString(),
            name: 'Chờ xử lý',
          },
          {
            code: constants.BOOKING_STATUS_PREPAID.toString(),
            name: 'Đã cọc',
          },
          {
            code: constants.BOOKING_STATUS_APPROVED.toString(),
            name: 'Đã thẩm định',
          },
          {
            code: constants.BOOKING_STATUS_RECEIVED.toString(),
            name: 'Giao xe',
          },
          {
            code: constants.BOOKING_STATUS_RUNNING.toString(),
            name: 'Đang đi',
          },
          {
            code: constants.BOOKING_STATUS_RETURNED.toString(),
            name: 'Trả xe',
          },
          {
            code: constants.BOOKING_STATUS_CANCELED.toString(),
            name: 'Hủy',
          },
          {
            code: constants.BOOKING_STATUS_REFUND.toString(),
            name: 'Hoàn cọc',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'verify_status',
        name: 'Trạng thái xác thực',
        value: JSON.stringify([
          {
            code: constants.CUSTOMER_VERIFY_STATUS_PENDING.toString(),
            name: 'Chưa xác thực',
          },
          {
            code: constants.CUSTOMER_VERIFY_STATUS_VERIFIED.toString(),
            name: 'Đã xác thực',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'profile_status',
        name: 'Tình trạng hồ sơ',
        value: JSON.stringify([
          {
            code: constants.CUSTOMER_PROFILE_STATUS_UNCOMPLETED.toString(),
            name: 'Chưa hoàn thiện',
          },
          {
            code: constants.CUSTOMER_PROFILE_STATUS_COMPLETED.toString(),
            name: 'Đã hoàn thiện',
          },
          {
            code: constants.CUSTOMER_PROFILE_STATUS_BLACKLIST.toString(),
            name: 'Blacklist',
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'payment_method',
        name: 'Hình thức thanh toán',
        value: JSON.stringify([
          {
            code: constants.PAYMENT_METHOD_ONLINE,
            name: 'Thanh toán online',
            parent: null,
            description: 'Tiết kiệm 5%',
            disabled: true,
          },
          {
            code: constants.PAYMENT_METHOD_VNPAY,
            name: 'Thanh toán VNPay',
            parent: constants.PAYMENT_METHOD_ONLINE,
          },
          {
            code: constants.PAYMENT_METHOD_MOMO,
            name: 'Thanh toán Ví Momo',
            parent: constants.PAYMENT_METHOD_ONLINE,
          },
          {
            code: constants.PAYMENT_METHOD_BANK,
            name: 'Chuyển khoản',
            parent: constants.PAYMENT_METHOD_ONLINE,
          },
          {
            code: constants.PAYMENT_METHOD_CASH,
            name: 'Thanh toán khi nhận xe',
            parent: null,
            description: 'Yêu cầu cọc 30% tiền thuê xe'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'operation_costs',
        name: 'Chi phí vận hành trước & trong giao dịch',
        value: JSON.stringify([
          {
            code: constants.OPERATION_COST_ETC_DEPOSIT,
            name: 'ETC Vshare nạp'
          },
          {
            code: constants.OPERATION_COST_MOTOR_PARKING,
            name: 'Phí gửi xe máy'
          },
          {
            code: constants.OPERATION_COST_FUEL_DEPOSIT,
            name: 'Phí nhiên liệu'
          },
          {
            code: constants.OPERATION_COST_MOVING,
            name: 'Phí đi lại'
          },
          {
            code: constants.OPERATION_COST_WASH,
            name: 'Phí rửa xe'
          },
          {
            code: constants.OPERATION_COST_CAR_PARKING,
            name: 'Gửi xe ô tô'
          },
          {
            code: constants.OPERATION_COST_COMMISSION,
            name: 'Phí bán hàng/hoa hồng'
          },
          {
            code: constants.OPERATION_COST_REPAIR,
            name: 'Phí sửa chữa'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'date_type',
        name: 'Loại ngày',
        value: JSON.stringify([
          {
            code: constants.SCHEDULE_DATE_TYPE_RECEIVE,
            name: 'Ngày nhận'
          },
          {
            code: constants.SCHEDULE_DATE_TYPE_RETURN,
            name: 'Ngày trả'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'booked_status',
        name: 'Trạng thái đặt',
        value: JSON.stringify([
          {
            code: constants.BOOKED_STATUS_HOLD,
            name: 'Đặt giữ chỗ'
          },
          {
            code: constants.BOOKED_STATUS_DEPOSIT,
            name: 'Đặt cọc'
          },
          {
            code: constants.BOOKED_STATUS_PAID100,
            name: 'Thanh toán 100%'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'delivery_status',
        name: 'Trạng thái giao nhận',
        value: JSON.stringify([
          {
            code: constants.DELIVERY_STATUS_PENDING,
            name: 'Chưa giao xe'
          },
          {
            code: constants.DELIVERY_STATUS_RECEIVED,
            name: 'Đã giao xe'
          },
          {
            code: constants.DELIVERY_STATUS_RETURNED,
            name: 'Đã trả xe'
          },
          {
            code: constants.DELIVERY_STATUS_CANCELED,
            name: 'Hủy'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'task_status',
        name: 'Trạng thái công việc',
        value: JSON.stringify([
          {
            code: constants.TASK_STATUS_PENDING,
            name: 'Đang xử lý'
          },
          {
            code: constants.TASK_STATUS_DONE,
            name: 'Hoàn thành'
          },
          {
            code: constants.TASK_STATUS_CANCELED,
            name: 'Hủy'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'task_type',
        name: 'Loại công việc',
        value: JSON.stringify([
          {
            code: constants.TASK_TYPE_RECEIVE,
            name: 'Giao xe'
          },
          {
            code: constants.TASK_TYPE_RETURN,
            name: 'Nhận xe'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'price_range',
        name: 'Khoảng giá',
        value: JSON.stringify([
          {
            code: '0-699999',
            name: 'Dưới 700k'
          },
          {
            code: '700000-899999',
            name: '700k - 900k'
          },
          {
            code: '900000-1099999',
            name: '900k - 1100k'
          },
          {
            code: '1100000-1299999',
            name: '1100k - 1300k'
          },
          {
            code: '1300000-9999999999',
            name: 'Trên 1300k'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
      {
        code: 'reconciliation',
        name: 'Loại đối soát',
        value: JSON.stringify([
          {
            code: constants.RECONCILIATION_EARLY,
            name: 'Đầu tháng'
          },
          {
            code: constants.RECONCILIATION_MIDDLE,
            name: '15 hàng tháng'
          },
          {
            code: constants.RECONCILIATION_LATE,
            name: 'Cuối tháng'
          },
          {
            code: constants.RECONCILIATION_PPT,
            name: 'Sau giao dịch'
          },
        ]), created_at: new Date(), updated_at: new Date()
      },
    ]);
  },
};
