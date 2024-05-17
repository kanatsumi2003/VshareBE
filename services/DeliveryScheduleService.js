'use strict';

const DateUtil = require('../utils/DateUtil');
const {
  DELIVERY_STATUS_PENDING: PendingStatus,
  DELIVERY_STATUS_RECEIVED: ReceiveStatus,
  DELIVERY_STATUS_RETURNED: ReturnStatus,
  DELIVERY_STATUS_CANCELED,
  SCHEDULE_DATE_TYPE_RETURN,
  SCHEDULE_DATE_TYPE_RECEIVE,
} = require('../constants');
const db = require('../models');
const { Op } = require('sequelize');

exports.getSchedule = async (params, options) => {
  const filters = _getFilter(params);
  const data = await db.booked_schedule.findAll({ ...filters, ...options });
  const result = {
    [PendingStatus]: {},
    [ReceiveStatus]: {},
    [ReturnStatus]: {},
  };

  if (data.length) {
    for (const row of data) {
      const branchVehicleId = row.branch_vehicle_id;
      const vehicle = _getVehicle(row);
      const item = _getDetail(row);
      if (row.delivery_status == PendingStatus) {
        if (!result[PendingStatus][branchVehicleId]) {
          result[PendingStatus][branchVehicleId] = vehicle;
        }
        else {
          result[PendingStatus][branchVehicleId].items.push(item)
        }
      }
      else if (row.delivery_status == ReceiveStatus) {
        if (!result[ReceiveStatus][branchVehicleId]) {
          result[ReceiveStatus][branchVehicleId] = vehicle;
        }
        else {
          result[ReceiveStatus][branchVehicleId].items.push(item)
        }
      }
      else if (row.delivery_status == ReturnStatus) {
        if (!result[ReturnStatus][branchVehicleId]) {
          result[ReturnStatus][branchVehicleId] = vehicle;
        }
        else {
          result[ReturnStatus][branchVehicleId].items.push(item)
        }
      }
    }
  }
  for (const status of Object.keys(result)) {
    result[status] = Object.values(result[status]);
  }
  return result;
}


function _getFilter(params) {
  const where = {
    delivery_status: {
      [Op.ne]: DELIVERY_STATUS_CANCELED
    }
  };
  if (params.delivery_status) {
    where.delivery_status = params.delivery_status.includes(',')
      ? { [Op.in]: params.delivery_status.split(',') }
      : params.delivery_status;
  }
  const whereBooking = params.branch_id ? { branch_id: params.branch_id } : {};

  const include = [
    {
      model: db.booking, attributes: ['id', 'code', 'other'],
      where: whereBooking,
      required: true,
      include: [
        { model: db.customer, attributes: ['fullname'], required: true },
      ]
    },
    {
      model: db.branch_vehicle,
      attributes: ['name', 'customer_base_price', 'customer_weekend_price'],
      required: true,
      include: [
        { model: db.vehicle, attributes: ['image'] },
      ]
    }
  ];

  if (params.date_type == SCHEDULE_DATE_TYPE_RECEIVE) {
    where.from_datetime = {
      [Op.between]: [params.start, params.end]
    }
  }
  else if (params.date_type == SCHEDULE_DATE_TYPE_RETURN) {
    where.to_datetime = {
      [Op.between]: [params.start, params.end]
    }
  }

  return {
    where,
    include,
    attributes: ['branch_vehicle_id', 'from_datetime', 'to_datetime', 'delivery_status'],
    raw: true,
  };
}

function _getVehicle(row) {
  return {
    branch_vehicle_id: row.branch_vehicle_id,
    customer_base_price: row['branch_vehicle.customer_base_price'],
    customer_weekend_price: row['branch_vehicle.customer_weekend_price'],
    vehicle_name: row['branch_vehicle.name'],
    vehicle_image: row['branch_vehicle.vehicle.image'],
    items: [_getDetail(row)]
  }
}

function _getDetail(row) {
  return {
    branch_vehicle_id: row.branch_vehicle_id,
    from: row.from_datetime,
    to: row.to_datetime,
    from_time: DateUtil.formatVNDatetime(row.from_datetime, 'H:mm'),
    to_time: DateUtil.formatVNDatetime(row.to_datetime, 'H:mm'),
    delivery_status: row.delivery_status,
    booking_id: row['booking.id'],
    booking_code: row['booking.code'],
    fullname: row['booking.customer.fullname'],
    note: row.delivery_status == PendingStatus ? (row['booking.other.receive_note'] || '')
      : row.delivery_status == ReceiveStatus ? (row['booking.other.return_note'] || '')
        : row.delivery_status == ReturnStatus ? (row['booking.other.final_note'] || '')
          : ''
  };
}
