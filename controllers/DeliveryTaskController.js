'use strict';

const moment = require('moment');
const momentTz = require('moment-timezone');
const { success: sendSuccess, error: sendError } = require('../utils/ResponseUtil');
const RegexUtil = require('../utils/RegexUtil');
const { getDeliveryTaskTypeLabel } = require('../helpers/SystemConfigHelper');
const { UserService, DeliveryTaskService, DeliveryScheduleService, BookingService } = require('../services');
const Constants = require('../constants');

exports.getItems = async (req, res) => {
  let data = [];
  try {
    const { rows, count } = await DeliveryTaskService.getAll(req.query);
    if (count) {
      data = rows.map(row => ({
        id: row.id,
        task_status: row.task_status,
        task_type: getDeliveryTaskTypeLabel(row.task_type),
        do_at: row.do_at,
        user_id: row.user_id,
        vehicle_image: row['branch_vehicle.vehicle.image'],
        vehicle_name: row['branch_vehicle.name'],
        booking_id: row['booking.id'],
        booking_code: row['booking.code'],
        fullname: row['booking.customer.fullname'],
        phone: row['booking.customer.phone'],
        email: row['booking.customer.email'],
      }))
    }
    return sendSuccess(res, { data, extra: { total: count } });
  } catch (error) {
    console.error(error);
    return sendSuccess(res, { data, extra: { total: 0 } });
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await DeliveryTaskService.getById(id);
    if (!item) {
      return sendError(res, { message: 'Không tìm thấy task', status: 404 });
    }
    if (body.user_id) {
      const user = await UserService.getById(body.user_id);
      if (!user) {
        throw new Error('Không tìm thấy người dùng')
      }
    }
    await DeliveryTaskService.updateById(id, body, item);
    return sendSuccess(res);
  } catch (error) {
    console.error('Error update delivery_task', error);
    return sendError(res, { message: error.message });
  }
}

exports.getSchedules = async (req, res) => {
  const { from_date, to_date, date_type, branch_id, license_number, vehicle_class, price_range, delivery_status } = req.query,
    scheduleParams = { delivery_status },
    branchVehicleParams = {},
    result = {
      minDate: from_date || moment().add(-7, 'days').format('YYYY-MM-DD'),
      maxDate: to_date || moment().add(7, 'days').format('YYYY-MM-DD'),
      data: []
    },
    minDatetime = momentTz.tz(result.minDate, 'Asia/Ho_Chi_Minh').startOf('day').format(),
    maxDatetime = momentTz.tz(result.maxDate, 'Asia/Ho_Chi_Minh').endOf('day').format();

  result.totalDays = Math.ceil(moment(maxDatetime).diff(minDatetime, 'day', true));
  result.listDays = Array.from({ length: result.totalDays }, (v, i) => i).map(i => moment(result.minDate).add(i, 'day').format('YYYY-MM-DD'));
  result.weekends = result.listDays.map(d => [0, 6].includes(moment(d).day()) ? d : null).filter(i => i)

  if (branch_id) {
    scheduleParams.branch_id = branch_id;
    branchVehicleParams.branch_id = branch_id;
  }
  if (!date_type)
    scheduleParams.date_type = Constants.SCHEDULE_DATE_TYPE_RECEIVE;
  if (license_number)
    branchVehicleParams.license_number = license_number;
  if (vehicle_class)
    branchVehicleParams.vehicle_class = vehicle_class;
  if (price_range) {
    const [price_from, price_to] = price_range.split('-');
    if (RegexUtil.numberRegex.test(price_from))
      branchVehicleParams.price_from = Number(price_from);
    if (RegexUtil.numberRegex.test(price_to))
      branchVehicleParams.price_to = Number(price_to);
  }

  try {
    result.data = await DeliveryScheduleService.getSchedule({
      ...scheduleParams,
      start: minDatetime,
      end: maxDatetime,
    }, {
      order: [['delivery_status', 'ASC']]
    })
    return sendSuccess(res, { data: result });
  } catch (error) {
    console.error(error);
    return sendSuccess(res, { data: result });
  }
}

exports.getItemByBookingId = async (req, res) => {
  try {
    const { body, params } = req;
    const { bookingId } = params;
    const data = await DeliveryTaskService.getByBookingId(bookingId);
    if (!data) {
      return sendError(res, { message: 'Không tìm thấy chi tiết giao nhận', status: 404 });
    }
    return sendSuccess(res, { data });
  } catch (error) {
    console.error('Error get delivery_task detail', error);
    return sendError(res, { message: error.message });
  }
}

exports.updateItemByBookingId = async (req, res) => {
  try {
    const { body, params } = req;
    const { bookingId } = params;
    const booking = await BookingService.getById(bookingId);
    if (!booking) {
      return sendError(res, { message: 'Không tìm thấy chi tiết giao nhận', status: 404 });
    }
    await DeliveryTaskService.updateByBookingId(bookingId, body, booking);
    return sendSuccess(res);
  } catch (error) {
    console.error('Error update delivery_task', error);
    return sendError(res, { message: error.message });
  }
}
