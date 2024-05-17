const XLSX = require("node-xlsx");
const momentTz = require("moment-timezone");
const { Op } = require("sequelize");
const { formatNumber, formatPhone0x } = require("../utils/FormatUtil");
const { getBookingStatusLabel, getApproveStatusLabel } = require("../helpers/BookingHelper");
const db = require("../models");

exports.exportBookingList = async (params) => {
  const where = {},
    customerWhere = {};

  Object.entries(params).map(([k, v]) => {
    if (v) {
      if (
        [
          "branch_id",
          "estimate_branch_vehicle_id",
          "actual_branch_vehicle_id",
          "source",
          "level",
          "booking_status",
        ].includes(k)
      ) {
        if (v.indexOf(",") > -1) {
          where[k] = {
            [Op.in]: v.split(","),
          };
        } else {
          where[k] = v;
        }
      } else if (["code"].includes(k)) {
        where[k] = {
          [Op.like]: `%${v}%`,
        };
      } else if (["phone", "fullname"].includes(k)) {
        if (k == "phone") {
          customerWhere.phone0x = {
            [Op.like]: `%${formatPhone0x(v)}%`,
          };
        } else {
          customerWhere[k] = {
            [Op.like]: `%${v}%`,
          };
        }
      }
    }
  });

  if (params.receive_datetime_from && params.receive_datetime_to) {
    where.estimate_receive_datetime = {
      [Op.between]: [
        params.receive_datetime_from,
        momentTz.tz(params.receive_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
      ],
    };
  } else if (params.receive_datetime_from) {
    where.estimate_receive_datetime = {
      [Op.gte]: params.receive_datetime_from,
    };
  } else if (params.receive_datetime_to) {
    where.estimate_receive_datetime = {
      [Op.lte]: momentTz.tz(params.receive_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
    };
  }

  if (params.return_datetime_from && params.return_datetime_to) {
    where.estimate_return_datetime = {
      [Op.between]: [
        params.return_datetime_from,
        momentTz.tz(params.return_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
      ],
    };
  } else if (params.return_datetime_from) {
    where.estimate_return_datetime = {
      [Op.gte]: params.return_datetime_from,
    };
  } else if (params.return_datetime_to) {
    where.estimate_return_datetime = {
      [Op.lte]: momentTz.tz(params.return_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
    };
  }

  const rows = await db.booking.findAll({
    attributes: [
      "code",
      "estimate_price",
      "actual_price",
      "rental_type",
      "source",
      "created_at",
      "estimate_receive_datetime",
      "estimate_return_datetime",
      "estimate_rental_duration",
      "actual_receive_datetime",
      "actual_return_datetime",
      "actual_rental_duration",
      "level",
      "prepay",
      "delivery_fee",
      "payment_method",
      "booking_status",
      "other",
      "other_cost",
      "operation_cost",
      "post_operation_cost",
      "revenue",
    ],
    where,
    include: [
      {
        model: db.customer,
        required: true,
        attributes: [
          "phone",
          "zalo",
          "fullname",
          "email",
          "birthday",
          "address",
          "identity_number",
          "identity_date",
          "driver_licence_number",
          "driver_licence_date",
          "other_data",
        ],
        where: customerWhere,
      },
      {
        model: db.branch,
        attributes: ["name"],
      },
      {
        model: db.branch_vehicle,
        attributes: ["name"],
        as: 'estimate_branch_vehicle',
      },
      {
        model: db.branch_vehicle,
        attributes: ["name"],
        as: 'actual_branch_vehicle',
      },
      {
        model: db.user,
        attributes: ["fullname"],
        as: 'give_user'
      },
      {
        model: db.user,
        attributes: ["fullname"],
        as: 'return_user'
      },
      {
        model: db.user,
        attributes: ["fullname"],
        as: 'saler'
      },
    ],
  });

  const data = [
    [
      "STT",
      "Mã đặt xe",
      "Khách hàng",
      "Số điện thoại",
      "Zalo",
      "Email",
      "Ngày sinh",
      "Địa chỉ",
      "CCCD/CMND",
      "Bằng lái",
      "Hộ khẩu",
      "Tài sản đặt cọc",
      "Giấy tờ khác",
      "CSKH",
      "Chi nhánh thuê",
      "Ngày nhận DK/TT",
      "Người giao",
      "Ngày trả DK/TT",
      "Người nhận",
      "Số ngày thuê DK/TT",
      "Tiền thuê xe",
      "Tiền cọc xe",
      "Phí giao nhận",
      "Tổng tiền thuê",
      "Phí phát sinh",
      "Phí vận hành trước GD",
      "Phí vận hành sau GD",
      "Doanh thu",
      "Hình thức thanh toán",
      "Hình thức nhận xe",
      "Thẩm định",
      "Km lúc giao/trả",
      "Nhiên liệu lúc giao/trả",
      "Nguồn",
      "Level",
      "Trạng thái",
      "Ngày ký HĐ",
      "Người làm HĐ",
    ],
  ];

  const cols = Array.from(Array(34).keys()).fill({ wch: 15 });
  cols[0] = { wch: 3 };
  const options = {
    sheetOptions: {
      "!cols": cols,
    },
  };

  if (rows.length) {
    await Promise.all(
      rows.map(async (row, idx) => {
        const customer = row.customer || {},
          customerOther = customer.other_data || {},
          otherData = row.other || {},
          approveInfo = [],
          branch = row.branch || {};

        if (otherData.approve_fullname || otherData.approve_username) {
          approveInfo.push('Thẩm định bởi: ' + (otherData.approve_fullname || otherData.approve_username));
          approveInfo.push('Trạng thái: ' + getApproveStatusLabel(otherData.approve_status));
          approveInfo.push('Điểm: ' + otherData.trust_score);
        }
        approveInfo.join('\n');

        const item = [
          idx + 1,
          row.code,
          customer.fullname,
          customer.phone,
          customer.zalo,
          customer.email,
          customer.birthday,
          customer.address,
          `${customer.identity_number ? "Số " + customer.identity_number : ""}\n${customer.identity_date ? "Cấp ngày " + customer.identity_date : ""}`,
          `${customer.driver_licence_number ? "Số " + customer.driver_licence_number : ""}\n${customer.driver_licence_date ? "Cấp ngày " + customer.driver_licence_date : ""}`,
          `${customer.house_hold ? "Số " + customer.house_hold : ""}\n${customer.house_hold_date ? "Cấp ngày " + customer.house_hold_date : ""}`,
          `${customerOther.asset_deposit || ""}\n${customerOther.asset_deposit_note ? "Ghi chú: " + customerOther.asset_deposit_note : ""}`,
          `${customerOther.other_paper || ""}\n${customerOther.other_paper_note ? "Ghi chú: " + customerOther.other_paper_note : ""}`,
          row.saler ? row.saler.fullname : "",
          branch.name || "",
          `${row.estimate_receive_datetime ? momentTz.tz(row.estimate_receive_datetime, "Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY") : ""} / ${row.actual_receive_datetime ? momentTz
            .tz(row.actual_receive_datetime, "Asia/Ho_Chi_Minh")
            .format("HH:mm DD/MM/YYYY") : ""}`,
          row.give_user ? row.give_user.fullname : "",
          `${row.estimate_return_datetime ? momentTz.tz(row.estimate_return_datetime, "Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY") : ""} / ${row.actual_return_datetime ? momentTz
            .tz(row.actual_return_datetime, "Asia/Ho_Chi_Minh")
            .format("HH:mm DD/MM/YYYY") : ""}`,
          row.return_user ? row.return_user.fullname : "",
          `${row.estimate_rental_duration || ""} / ${row.actual_rental_duration || ""}`,
          formatNumber(row.actual_price),
          formatNumber(row.prepay),
          formatNumber(row.delivery_fee),
          formatNumber(row.total_amount),
          formatNumber(row.other_cost),
          formatNumber(row.operation_cost),
          formatNumber(row.post_operation_cost),
          formatNumber(row.revenue),
          row.payment_method,
          row.receive_type, //TODO: 
          approveInfo,
          `${otherData.receive_km || ''} / ${otherData.return_km || ''}`,
          `${otherData.receive_fuel || ''} / ${otherData.return_fuel || ''}`,
          row.source,
          row.level,
          getBookingStatusLabel(row.booking_status),
        ];
        data.push(item);
      })
    );
    return XLSX.build([{ data }], options);
  }
  return XLSX.build([{ data }], options);
};

exports.exportCustomerList = async (params) => {
  const where = {}, whereBooking = {};

  Object.entries(params).forEach(([k, v]) => {
    if (typeof v != 'undefined') {
      if (["branch_id", "profile_status"].includes(k)) {
        where[k] = v;
      } else if (["phone", "fullname", "email"].includes(k)) {
        if (k == "phone") {
          where.phone0x = {
            [Op.like]: `%${formatPhone0x(v)}%`,
          };
        } else {
          where[k] = {
            [Op.like]: `%${v}%`,
          };
        }
      }
    }
  });
  if (typeof params.number_success_booking != 'undefined') {
    where.number_success_booking = params.number_success_booking > 1
      ? { [Op.gt]: 1 }
      : Number(params.number_success_booking);
  }
  if (params.booking_code || params.bookings) {
    whereBooking.code = {
      [Op.like]: `%${params.booking_code || params.bookings}%`,
    };
    delete params.booking_code;
    delete params.bookings;
  }

  const rows = await db.customer.findAll({
    where,
    include: [{ model: db.booking, attributes: ['code'], where: whereBooking, require: false }]
  });
  const data = [
    ["STT", "Khách hàng", "Số điện thoại", "Zalo", "Email", "Mã đơn hàng", "Ngày sinh", "Địa chỉ", "CCCD/CMND", "Bằng lái", "Hộ khẩu", "Tài sản đặt cọc", "Giấy tờ khác", "Ngày tạo"],
  ];

  const cols = Array.from(Array(14).keys()).fill({ wch: 15 });
  cols[0] = { wch: 3 };
  const options = {
    sheetOptions: {
      "!cols": cols,
    },
  };

  if (rows.length) {
    rows.forEach((customer, idx) => {
      const customerOther = customer.other_data || {}
      const item = [
        idx + 1,
        customer.fullname,
        customer.phone,
        customer.zalo,
        customer.email,
        customer.bookings.map(b => b.code).join(", "),
        customer.birthday,
        customer.address,
        `${customer.identity_number ? "Số " + customer.identity_number : ""}\n${customer.identity_date ? "Cấp ngày " + customer.identity_date : ""}`,
        `${customer.driver_licence_number ? "Số " + customer.driver_licence_number : ""}\n${customer.driver_licence_date ? "Cấp ngày " + customer.driver_licence_date : ""}`,
        `${customer.house_hold ? "Số " + customer.house_hold : ""}\n${customer.house_hold_date ? "Cấp ngày " + customer.house_hold_date : ""}`,
        `${customerOther.asset_deposit || ""}\n${customerOther.asset_deposit_note ? "Ghi chú: " + customerOther.asset_deposit_note : ""}`,
        `${customerOther.other_paper || ""}\n${customerOther.other_paper_note ? "Ghi chú: " + customerOther.other_paper_note : ""}`,
        momentTz.tz(customer.created_at, "Asia/Ho_Chi_Minh").format("HH:mm DD-MM-YYYY"),
      ];
      data.push(item);
    });
    return XLSX.build([{ data }], options);
  }
  return XLSX.build([{ data }], options);
};
