"use strict";

const Op = require("sequelize").Op;
const moment = require("moment");
const { success: resSuccess, error: resError } = require("../utils/ResponseUtil");
const DateUtil = require("../utils/DateUtil");
const { formatListItemOutput, formatNumber } = require("../utils/FormatUtil");
const BookingService = require("../services/BookingService");
const BranchService = require("../services/BranchService");
const BranchVehicleService = require("../services/BranchVehicleService");
const CustomerService = require("../services/CustomerService");
const SystemConfigService = require("../services/SystemConfigService");
const BookedScheduleService = require("../services/BookedScheduleService");
const DocumentService = require("../services/DocumentService");
const UserService = require("../services/UserService");
const { PriceService } = require("../services");
const constants = require("../constants");

exports.createItem = async (req, res) => {
  try {
    const { body } = req;
    let branch;
    if (body.branch_id) {
      branch = await BranchService.getById(body.branch_id);
      if (!branch) {
        throw new Error("Chi nhánh không tồn tại");
      }
    }
    if (body.customer_id) {
      const customer = await CustomerService.getById(body.customer_id);
      if (!customer) {
        throw new Error("Khách hàng cũ không tồn tại");
      }
    }

    let estBranchVehicle;
    if (body.estimate_branch_vehicle_id) {
      estBranchVehicle = await BranchVehicleService.getById(body.estimate_branch_vehicle_id);
      if (!estBranchVehicle) {
        throw new Error("Xe dự kiến không tồn tại");
      }
    }
    if (body.actual_branch_vehicle_id) {
      const actBranchVehicle = await BranchVehicleService.getById(body.actual_branch_vehicle_id);
      if (!actBranchVehicle) {
        throw new Error("Xe thực tế không tồn tại");
      }
    }
    if (body.payment_method) {
      const paymentMethod = await SystemConfigService.getPaymentMethod(body.payment_method);
      if (!paymentMethod) {
        throw new Error("Hình thức thanh toán không tồn tại");
      }
    }
    if (
      body.estimate_branch_vehicle_id &&
      body.estimate_receive_datetime &&
      body.estimate_return_datetime &&
      !body.actual_branch_vehicle_id &&
      !body.actual_receive_datetime
    ) {
      const isAvaiableVehicle = await BookedScheduleService.checkAvaiableVehicle(
        body.estimate_branch_vehicle_id,
        body.estimate_receive_datetime,
        body.estimate_return_datetime
      );
      if (!isAvaiableVehicle) {
        throw new Error("Xe dự kiến thuê bị trùng lịch");
      }
    }
    if (
      body.level == "L8" &&
      (!body.actual_branch_vehicle_id ||
        !body.actual_receive_datetime ||
        !body.actual_return_datetime ||
        !body.actual_rental_duration)
    ) {
      throw new Error("Booking L8 cần đủ thông tin: xe và thời gian thuê thực tế.");
    }

    if (body.approve_by) {
      const approveUser = await UserService.getById(body.approve_by);
      if (!approveUser) {
        throw new Error("Người thẩm định không tồn tại");
      }
      body.approve_fullname = approveUser.fullname;
      body.approve_username = approveUser.username;
    }

    if (branch) {
      let bookingService;
      if (body.add_ons) {
        const addonRentalDriver = body.add_ons.find((ao) => ao.code == constants.ADDON_DRIVER && ao.cost > 0);
        bookingService = addonRentalDriver
          ? constants.BOOKING_SERVICE_RENTAL_DRIVER
          : constants.BOOKING_SERVICE_RENTAL_CAR;
      }
      body.code = await BookingService.genBookingCode(branch.code, body.vehicle_type, bookingService);
    }

    if (!body.estimate_price) {
      const estimatePrice = await PriceService.calculatePrice({
        receive_datetime: body.estimate_receive_datetime,
        return_datetime: body.estimate_return_datetime,
        base_price: estBranchVehicle.customer_base_price,
        weekend_price: estBranchVehicle.customer_weekend_price,
        overtime_price: estBranchVehicle.customer_overtime_price,
      });
      body.estimate_price = estimatePrice.rental_price;
      if (!body.estimate_rental_duration) {
        body.estimate_rental_duration = estimatePrice.duration_days;
        if (estimatePrice.duration_hours) {
          body.estimate_rental_duration += `d${estimatePrice.duration_hours}h`;
        }
      }
    }

    const item = await BookingService.create(body);
    return resSuccess(res, { data: item });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { body: data, params } = req;
    const { id } = params;
    const item = await BookingService.getById(id);
    if (!item) {
      return resError(res, {
        message: "Không tìm thấy thông tin đơn hàng",
        status: 404,
      });
    }
    let branchTmp;
    if (data.branch_id && data.branch_id != item.branch_id) {
      branchTmp = await BranchService.getById(data.branch_id);
      if (!branchTmp) {
        return resError(res, { message: "Chi nhánh không tồn tại" });
      }
    }
    if (data.customer_id && data.customer_id != item.customer_id) {
      const customer = await CustomerService.getById(data.customer_id);
      if (!customer) {
        throw new Error("Khách hàng cũ không tồn tại");
      }
    }
    if (
      data.estimate_receive_datetime &&
      data.estimate_return_datetime &&
      moment(data.estimate_return_datetime, "YYYY-MM-DD HH:mm", true).diff(
        moment(data.estimate_receive_datetime, "YYYY-MM-DD HH:mm", true),
        "minute"
      ) <= 0
    ) {
      throw new Error("Thời gian trả xe không nhỏ hơn nhận xe dự kiến");
    } else if (
      data.estimate_receive_datetime &&
      !data.estimate_return_datetime &&
      moment(item.estimate_return_datetime).diff(
        moment(data.estimate_receive_datetime, "YYYY-MM-DD HH:mm", true),
        "minute"
      ) <= 0
    ) {
      throw new Error("Thời gian nhận xe dự kiến không hợp lệ");
    } else if (
      !data.estimate_receive_datetime &&
      data.estimate_return_datetime &&
      moment(data.estimate_return_datetime, "YYYY-MM-DD HH:mm", true).diff(
        moment(item.estimate_receive_datetime),
        "minute"
      ) <= 0
    ) {
      throw new Error("Thời gian trả xe dự kiến không hợp lệ");
    }

    if (
      data.actual_receive_datetime &&
      data.actual_return_datetime &&
      moment(data.actual_return_datetime, "YYYY-MM-DD HH:mm", true).diff(
        moment(data.actual_receive_datetime, "YYYY-MM-DD HH:mm", true),
        "minute"
      ) <= 0
    ) {
      throw new Error("Thời gian trả xe không nhỏ hơn nhận xe thực tế");
    } else if (
      data.actual_receive_datetime &&
      !data.actual_return_datetime &&
      moment(item.actual_return_datetime).diff(
        moment(data.actual_receive_datetime, "YYYY-MM-DD HH:mm", true),
        "minute"
      ) <= 0
    ) {
      throw new Error("Thời gian nhận xe thực tế không hợp lệ");
    } else if (
      !data.actual_receive_datetime &&
      data.actual_return_datetime &&
      moment(data.actual_return_datetime, "YYYY-MM-DD HH:mm", true).diff(
        moment(item.actual_receive_datetime),
        "minute"
      ) <= 0
    ) {
      throw new Error("Thời gian trả xe thực tế không hợp lệ");
    }

    if (data.payment_method && data.payment_method != item.payment_method) {
      const paymentMethod = await SystemConfigService.getPaymentMethod(data.payment_method);
      if (!paymentMethod) {
        throw new Error("Không tìm thấy Hình thức thanh toán");
      }
    }
    let changeService;
    if (data.add_ons) {
      const addonRentalDriverUpdate = data.add_ons.find((ao) => ao.code == constants.ADDON_DRIVER && ao.cost > 0);
      const addonRentalDriverOld = (item.add_ons || []).find((ao) => ao.code == constants.ADDON_DRIVER && ao.cost > 0);
      if (!!addonRentalDriverUpdate !== !!addonRentalDriverOld) {
        changeService = addonRentalDriverUpdate
          ? constants.BOOKING_SERVICE_RENTAL_DRIVER
          : constants.BOOKING_SERVICE_RENTAL_CAR;
      }
    }
    if (branchTmp || (data.vehicle_type && data.vehicle_type != item.vehicle_type) || changeService) {
      const branchCode = branchTmp
        ? branchTmp.code
        : (await BranchService.getOne({ id: item.branch_id }, { attributes: ["code"] })).code;
      data.code = await BookingService.genBookingCode(
        branchCode,
        data.vehicle_type || item.vehicle_type,
        changeService
      );
    }
    await BookingService.updateById(id, data, item.toJSON());
    return resSuccess(res);
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await BookingService.getAll(params);
    let data = [];
    if (count) {
      data = rows.map((row) => ({
        id: row.id,
        code: row.code,
        estimate_branch_vehicle_id: row.estimate_branch_vehicle ? row.estimate_branch_vehicle.name : "",
        actual_branch_vehicle_id: row.actual_branch_vehicle ? row.actual_branch_vehicle.name : "",
        branch_id: row.branch ? row.branch.name : "",
        fullname: row.fullname,
        phone: row.phone,
        email: row.email || "",
        price: formatListItemOutput(formatNumber(row.estimate_price), formatNumber(row.actual_price)),
        receive_datetime: formatListItemOutput(
          row.estimate_receive_datetime ? DateUtil.formatVNDatetime(row.estimate_receive_datetime, "YYYY-MM-DD HH:mm") : "",
          row.actual_receive_datetime ? DateUtil.formatVNDatetime(row.actual_receive_datetime, "YYYY-MM-DD HH:mm") : ""
        ),
        return_datetime: formatListItemOutput(
          row.estimate_return_datetime ? DateUtil.formatVNDatetime(row.estimate_return_datetime, "YYYY-MM-DD HH:mm") : "",
          row.actual_return_datetime ? DateUtil.formatVNDatetime(row.actual_return_datetime, "YYYY-MM-DD HH:mm") : ""
        ),
        rental_duration: formatListItemOutput(row.estimate_rental_duration, row.actual_rental_duration),
        source: row.source,
        level: row.level,
        booking_status: (row.booking_status || constants.BOOKING_STATUS_PENDING).toString(),
      }));
    }
    return resSuccess(res, { data, extra: { total: count } });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
};

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await BookingService.getOne({ id });
    if (!data) {
      return resError(res, {
        message: "Không tìm thấy thông tin đơn hàng",
        status: 404,
      });
    }
    return resSuccess(res, { data });
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BookingService.getById(id);
    if (!item) {
      return resError(res, {
        message: "Không tìm thấy thông tin đơn hàng",
        status: 404,
      });
    }
    await BookingService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.previewDocument = async (req, res) => {
  try {
    const { id, entity } = req.params;
    const booking = await BookingService.getOne({ id }, { includeBranch: true, includeVehicle: true });
    if (!booking) {
      return resError(res, {
        message: "Không tìm thấy thông tin đơn hàng",
        status: 404,
      });
    }
    let file, fileName;
    if (entity == "contract") {
      file = await DocumentService.genBookingContract(booking);
      fileName = "Hop_Dong_Thue_Xe";
    } else if (entity == "receive_report") {
      file = await DocumentService.genReceiveReport(booking);
      fileName = "Bien_Ban_Giao_Nhan_Xe";
    }
    if (file) {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}.docx`);
      res.attachment(`${fileName}.docx`);
      return res.send(file);
    }
    throw new Error("Đối tượng không hợp lệ");
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
};

exports.createQuickBooking = async (req, res) => {
  try {
    const { body } = req;
    const estBranchVehicle = await BranchVehicleService.getById(body.estimate_branch_vehicle_id);
    if (!estBranchVehicle) {
      throw new Error("Xe dự kiến không tồn tại");
    }

    const isAvaiableVehicle = await BookedScheduleService.checkAvaiableVehicle(
      body.estimate_branch_vehicle_id,
      body.estimate_receive_datetime,
      body.estimate_return_datetime
    );
    if (!isAvaiableVehicle) {
      throw new Error("Xe dự kiến thuê bị trùng lịch");
    }

    const branch = await estBranchVehicle.getBranch({ attributes: ['id', 'code'] });
    if (!branch) {
      throw new Error("Chi nhánh không tồn tại");
    }
    body.branch_id = branch.id;

    const vehicle = await estBranchVehicle.getVehicle({ attributes: ['vehicle_type'] });
    if (vehicle) {
      body.vehicle_type = vehicle.vehicle_type;
    }

    const estimatePrice = await PriceService.getEstimatePriceDetail(body.estimate_branch_vehicle_id, body.estimate_receive_datetime, body.estimate_return_datetime);
    body.estimate_rental_duration = estimatePrice.duration;
    body.estimate_price = estimatePrice.totalPrice;
    body.code = await BookingService.genBookingCode(branch.code, body.vehicle_type, constants.BOOKING_SERVICE_RENTAL_CAR);

    const item = await BookingService.create(body);
    return resSuccess(res, { data: item });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.calculatePrice = async (req, res) => {
  try {
    const
      body = req.body,
      { branch_vehicle_id } = body;

    const branchVehicle = await BranchVehicleService.getById(branch_vehicle_id);
    if (!branchVehicle) {
      throw new Error('Không tìm thấy thông tin xe');
    }

    body.base_price = branchVehicle.customer_base_price || 0;
    body.weekend_price = branchVehicle.customer_weekend_price || 0;
    body.overtime_price = branchVehicle.customer_overtime_price || 0;

    const result = await PriceService.calculatePrice(body);
    return resSuccess(res, { data: result });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.getMyBookings = async (req, res) => {
  try {
    const
      data = {},
      params = req.query,
      { sub } = req.user;

    params.customer_id = sub;
    const processingData = await BookingService.getCustomerBookings({
      ...params,
      estimate_receive_datetime: {
        [Op.gt]: moment().format(),
      },
      level: {
        [Op.notIn]: ['L8', 'L9']
      }
    });
    const completeData = await BookingService.getCustomerBookings({
      ...params,
      [Op.or]: [
        {
          estimate_receive_datetime: {
            [Op.lte]: moment().format(),
          },
        },
        {
          level: {
            [Op.in]: ['L8', 'L9']
          }
        }
      ]
    });
    data.processing_count = processingData.count;
    data.processing_data = processingData.rows.map(row => ({
      id: row.id,
      code: row.code,
      level: row.level,
      status: row.booking_status,
      from_date: row.actual_receive_datetime || row.estimate_receive_datetime,
      to_date: row.actual_return_datetime || row.estimate_return_datetime,
      vehicle_name: row['actual_branch_vehicle.vehicle.name'] || row['estimate_branch_vehicle.vehicle.name'],
      vehicle_version: row['actual_branch_vehicle.vehicle.version'] || row['estimate_branch_vehicle.vehicle.version'],
      vehicle_image: row['actual_branch_vehicle.vehicle.image'] || row['estimate_branch_vehicle.vehicle.image'],
      payment_method: row.payment_method,
      amount: row.actual_price || row.estimate_price,
    }));
    data.complete_count = completeData.count;
    data.complete_data = completeData.rows.map(row => ({
      id: row.id,
      code: row.code,
      level: row.level,
      status: row.booking_status,
      from_date: row.actual_receive_datetime || row.estimate_receive_datetime,
      to_date: row.actual_return_datetime || row.estimate_return_datetime,
      vehicle_name: row['actual_branch_vehicle.vehicle.name'] || row['estimate_branch_vehicle.vehicle.name'],
      vehicle_version: row['actual_branch_vehicle.vehicle.version'] || row['estimate_branch_vehicle.vehicle.version'],
      vehicle_image: row['actual_branch_vehicle.vehicle.image'] || row['estimate_branch_vehicle.vehicle.image'],
      payment_method: row.payment_method,
      amount: row.actual_price || row.estimate_price,
    }));
    return resSuccess(res, { data });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.cancelItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BookingService.getById(id);
    if (!item) {
      return resError(res, {
        message: "Không tìm thấy thông tin đơn hàng",
        status: 404,
      });
    }
    await BookingService.updateById(id, { booking_status: constants.BOOKING_STATUS_CANCELED }, item.toJSON());
    return resSuccess(res);
  } catch (error) {
    return resError(res, { message: err.message });
  }
}