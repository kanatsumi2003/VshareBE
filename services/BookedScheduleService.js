'use strict'

const { Op } = require('sequelize');
const db = require('../models');
const Constants = require('../constants');
const { getBookingStatusName } = require('../helpers/SystemConfigHelper');
const DateUtil = require('../utils/DateUtil');
const AbstractBaseService = require('./AbstractBaseService');

class BookedScheduleService extends AbstractBaseService {
  constructor() {
    super(db.booked_schedule);
  }

  getSchedule = async (params, options) => {
    const filters = _getFilter(params);
    const data = await this.model.findAll({ ...filters, ...options });

    if (data.length) {
      if (params.raw == 'true')
        return data.map(row => _getDetail(row))

      const result = {};
      data.forEach(row => {
        const detail = _getDetail(row);
        if (!result[row.branch_vehicle_id]) {
          result[row.branch_vehicle_id] = {
            branch_vehicle_id: row.branch_vehicle_id,
            items: [detail]
          }
        }
        else {
          result[row.branch_vehicle_id].items.push(detail);
        }
      });
      return Object.values(result);
    }
    return data;
  }

  async checkAvaiableVehicle(branch_vehicle_id, from_datetime, to_datetime) {
    const data = await this.model.findOne({
      where: {
        from_datetime: {
          [Op.lte]: to_datetime
        },
        to_datetime: {
          [Op.gte]: from_datetime
        },
        delivery_status: {
          [Op.ne]: Constants.DELIVERY_STATUS_CANCELED,
        },
        branch_vehicle_id
      },
    });
    return !data;
  }

  async setupBookedSchedule(bookingId, bookingData, options) {
    const schedule = await db.booked_schedule.findOne({ where: { booking_id: bookingId } })

    let scheduleStatus
    // Giao xe
    if (bookingData.booking_status == Constants.BOOKING_STATUS_RECEIVED && (!schedule || schedule.delivery_status == Constants.DELIVERY_STATUS_PENDING)) {
      scheduleStatus = Constants.DELIVERY_STATUS_RECEIVED;
    }
    // Trả xe
    else if ((bookingData.booking_status == Constants.BOOKING_STATUS_RETURNED || bookingData.level == "L9") && (!schedule || schedule.delivery_status == Constants.DELIVERY_STATUS_RECEIVED)) {
      scheduleStatus = Constants.DELIVERY_STATUS_RETURNED;
    }
    // Hủy
    else if (bookingData.booking_status == Constants.BOOKING_STATUS_CANCELED && (!schedule || schedule.delivery_status != Constants.DELIVERY_STATUS_CANCELED)) {
      scheduleStatus = Constants.DELIVERY_STATUS_CANCELED;
    }

    if (!schedule && ["L5", "L6", "L7", "L8"].includes(bookingData.level)) {
      await db.booked_schedule.create({
        branch_vehicle_id: bookingData.actual_branch_vehicle_id || bookingData.estimate_branch_vehicle_id,
        booking_id: bookingId,
        from_datetime: bookingData.actual_receive_datetime || bookingData.estimate_receive_datetime,
        to_datetime: bookingData.actual_return_datetime || bookingData.estimate_return_datetime,
        delivery_status: scheduleStatus,
      }, { ...options });
    }
    else if (schedule && scheduleStatus) {
      schedule.delivery_status = scheduleStatus;
      if (bookingData.actual_branch_vehicle_id && bookingData.actual_branch_vehicle_id != schedule.branch_vehicle_id) {
        schedule.branch_vehicle_id = bookingData.actual_branch_vehicle_id;
      }
      if (bookingData.actual_receive_datetime && bookingData.actual_receive_datetime != schedule.from_datetime) {
        schedule.from_datetime = bookingData.actual_receive_datetime;
      }
      if (bookingData.actual_return_datetime && bookingData.actual_return_datetime != schedule.to_datetime) {
        schedule.to_datetime = bookingData.actual_return_datetime;
      }
      await schedule.save({ ...options });
    }
  }

  async getDeliveryTasks() {

  }
}

function _getFilter(params) {
  const where = {},
    whereBooking = params.branch_id ? { branch_id: params.branch_id } : {};

  whereBooking.estimate_receive_datetime = { [Op.ne]: null };
  whereBooking.estimate_return_datetime = { [Op.ne]: null };

  const include = [
    {
      model: db.booking, attributes: ['id', 'code', 'estimate_receive_datetime', 'estimate_return_datetime', 'estimate_rental_duration', 'actual_receive_datetime', 'actual_return_datetime', 'actual_rental_duration', 'booking_status', 'other'],
      where: whereBooking,
      required: true,
      include: [
        { model: db.customer, attributes: ['fullname', 'phone', 'zalo', 'email'], required: true },
      ]
    },
  ];

  if (params.date_type == Constants.SCHEDULE_DATE_TYPE_RECEIVE) {
    where.from_datetime = {
      [Op.between]: [params.start, params.end]
    }
  }
  else if (params.date_type == Constants.SCHEDULE_DATE_TYPE_RETURN) {
    where.to_datetime = {
      [Op.between]: [params.start, params.end]
    }
  }

  return {
    where,
    include,
    attributes: ['branch_vehicle_id', 'from_datetime', 'to_datetime', 'delivery_status']
  };
}

function _getDetail(row) {
  return {
    from: row.from_datetime,
    to: row.to_datetime,
    from_time: DateUtil.formatVNDatetime(row.from_datetime, 'H:mm'),
    to_time: DateUtil.formatVNDatetime(row.to_datetime, 'H:mm'),
    delivery_status: row.delivery_status,
    booking_id: row.booking.id,
    booking_code: row.booking.code,
    booking_status: getBookingStatusName(row.booking.booking_status),
    fullname: row.booking.customer.fullname,
    phone: row.booking.customer.phone,
    email: row.booking.customer.email || '',
    zalo: row.booking.customer.zalo || '',
    booked_status: row.booking.other.booked_status || '',
    detail: `
      - Mã booking: ${row.booking.code}
      - Trạng thái: ${getBookingStatusName(row.booking.booking_status)}
      - Họ tên: ${row.booking.customer.fullname}
      - SDT: ${row.booking.customer.phone}
      - Email: ${row.booking.customer.email || ''}
      - Zalo: ${row.booking.customer.zalo || ''}
      - Dự kiến: ${DateUtil.formatVNDatetime(row.booking.estimate_receive_datetime, 'HH:mm DD/MM')} - ${DateUtil.formatVNDatetime(row.booking.estimate_return_datetime, 'HH:mm DD/MM')}
      - Thực tế: ${row.booking.actual_receive_datetime ? DateUtil.formatVNDatetime(row.booking.actual_receive_datetime, 'HH:mm DD/MM') : '_'} - ${row.booking.actual_return_datetime ? DateUtil.formatVNDatetime(row.booking.actual_return_datetime, 'HH:mm DD/MM') : '_'}
    `
  };
}

module.exports = new BookedScheduleService();
