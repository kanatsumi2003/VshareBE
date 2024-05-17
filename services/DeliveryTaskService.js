/* eslint-disable no-prototype-builtins */
'use strict'

const Op = require('sequelize').Op;
const db = require('../models');
const { buildQuery } = require('../helpers/QueryHelper');
const { vnZone, customDatetimeFormat } = require('../utils/DateUtil');
const AbstractBaseService = require('./AbstractBaseService');
const MediaService = require('./MediaService');
const BookingService = require('./BookingService');

class DeliveryTaskService extends AbstractBaseService {
  constructor() {
    super(db.delivery_task);
  }

  getAll = async (params) => {
    const query = buildQuery(params);
    delete query.where.from_date;
    delete query.where.to_date;

    if (params.task_status && params.task_status.indexOf(',')) {
      query.where.task_status = {
        [Op.in]: params.task_status.split(',')
      }
    }
    if (params.from_date && params.to_date) {
      query.where.do_at = {
        [Op.between]: [
          vnZone(params.from_date).startOf('day').format(),
          vnZone(params.to_date).endOf('day').format(),
        ]
      };
    }
    else if (params.from_date) {
      query.where.do_at = {
        [Op.gte]: vnZone(params.from_date).startOf('day').format()
      }
    }
    else if (params.to_date) {
      query.where.do_at = {
        [Op.lte]: vnZone(params.to_date).startOf('day').format()
      }
    }
    else {
      const today = vnZone('Asia/Ho_Chi_Minh').format();
      query.where.do_at = {
        [Op.between]: [
          vnZone(today).startOf('day').format(),
          vnZone(today).endOf('day').format(),
        ]
      };
    }

    const bookingWhere = {}, customerWhere = {}, branchVehicleWhere = {};

    Object.entries(params).forEach(([k, v]) => {
      if ("booking_code" == k && v) {
        delete query.where[k];
        bookingWhere['code'] = {
          [Op.like]: `%${v}%`,
        };
      }
      else if (["fullname", "phone", "email"].includes(k) && v) {
        delete query.where[k];
        customerWhere[k] = {
          [Op.like]: `%${v}%`,
        };
      }
      else if (["vehicle_name"].includes(k) && v) {
        delete query.where[k];
        branchVehicleWhere.name = {
          [Op.like]: `%${v}%`,
        };
      }
      else if (v.indexOf(',') > -1) {
        query.where[k] = {
          [Op.in]: v.split(',')
        }
      }
    });

    if (params.branch_id) {
      bookingWhere.branch_id = params.branch_id;
      delete query.where.branch_id;
    }

    return this.model.findAndCountAll({
      ...query,
      include: [
        {
          model: db.booking, attributes: ['id', 'code'], where: bookingWhere, required: true, include: [
            { model: db.customer, attributes: ['fullname', 'phone', 'email'], where: customerWhere, required: true },
          ]
        },
        {
          model: db.branch_vehicle, attributes: ['name'], where: branchVehicleWhere, include: [
            { model: db.vehicle, attributes: ['image'], required: true }
          ]
        },
      ],
      raw: true
    })
  }

  updateById = async (id, data, oldTask) => {
    const t = await db.sequelize.transaction();
    try {
      if (data.delivery_status && data.delivery_status != oldTask.delivery_status) {
        const booking = await db.booking.findByPk(oldTask.booking_id, { attributes: ['id', 'other'] });
        booking.other = { ...booking.other, delivery_status: data.delivery_status };
        await booking.save({ transaction: t });
      }
      await this.model.update(data, {
        where: { id },
        transaction: t,
        returning: true,
      });
      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }

  getByBookingId = async (bookingId) => {
    const booking = await db.booking.findOne({
      where: { id: bookingId },
      attributes: [
        'id', ['id', 'booking_id'], ['code', 'booking_code'], 'customer_id', 'branch_id',
        'estimate_branch_vehicle_id', 'actual_branch_vehicle_id', 'actual_price', 'prepay',
        'total_amount', 'delivery_fee', 'estimate_receive_datetime', 'actual_receive_datetime',
        'estimate_return_datetime', 'actual_return_datetime', 'give_user_id', 'return_user_id',
        'vat', 'deposit', 'add_ons', 'discount_amount', 'vat_cost', 'other',
      ]
    });

    if (booking) {
      const result = {
        ...booking.toJSON(),
        receive_datetime: customDatetimeFormat(booking.actual_receive_datetime || booking.estimate_receive_datetime, "YYYY-MM-DD HH:mm"),
        return_datetime: customDatetimeFormat(booking.actual_return_datetime || booking.estimate_return_datetime, "YYYY-MM-DD HH:mm"),
      }
      delete booking.estimate_receive_datetime;
      delete booking.actual_receive_datetime;
      delete booking.estimate_return_datetime;
      delete booking.actual_return_datetime;

      const bookingSchedule = await booking.getBooked_schedule({ attributes: ['delivery_status'] }) || {};
      result.delivery_status = bookingSchedule.delivery_status || '';

      const customer = await booking.getCustomer({
        attributes: [["phone0x", "phone"], "fullname"],
      });
      if (customer) {
        delete result.customer_id;
        Object.entries(customer.toJSON()).forEach(([key, val]) => (result[key] = val));
      }

      result.other_costs = await booking.getBooking_other_costs({ attributes: ["cost", "code", "note"] });
      result.operation_costs = await booking.getBooking_operation_costs({ where: { type: 'pre' }, attributes: ["cost", "code", "note"] });
      result.post_operation_costs = await booking.getBooking_operation_costs({ where: { type: 'post' }, attributes: ["cost", "code", "note"] });

      const branch = await booking.getBranch({ attributes: ['name', 'other_data'] }) || {};
      result.branch_name = branch.name;
      const {
        bank_account_name,
        bank_account_number, 
        bank_name, 
        bank_branch_name, 
      } = branch.other_data || {};
      result.branch = {
        bank_account_name,
        bank_account_number, 
        bank_name, 
        bank_branch_name, 
      }
      delete result.branch_id;

      if (booking.actual_branch_vehicle_id) {
        const branchVehicle = await booking.getActual_branch_vehicle({ attributes: ['name'] }) || {};
        result.branch_vehicle_name = branchVehicle.name;
      }
      else {
        const branchVehicle = await booking.getEstimate_branch_vehicle({ attributes: ['name'] }) || {};
        result.branch_vehicle_name = branchVehicle.name;
      }
      delete result.actual_branch_vehicle_id;
      delete result.estimate_branch_vehicle_id;

      if (booking.other) {
        Object.entries(booking.other).forEach(([key, value], _) => result[key] = value);
        if (typeof result.receive_km === 'undefined') result.receive_km = null;
        if (typeof result.return_km === 'undefined') result.return_km = null;
        if (typeof result.receive_fuel === 'undefined') result.receive_fuel = null;
        if (typeof result.return_fuel === 'undefined') result.return_fuel = null;
        delete result.other;
      }
      result.before_car_image = {};
      const beforeCarImages = await MediaService.findAll(
        { target_table: db.booking.tableName, target_id: booking.id, target_type: "before_car_image" },
        { attributes: ["media_name", "path"] }
      );
      beforeCarImages.forEach((img) => (result.before_car_image[img.media_name] = img.path));

      result.after_car_image = {};
      const afterCarImages = await MediaService.findAll(
        { target_table: db.booking.tableName, target_id: booking.id, target_type: "after_car_image" },
        { attributes: ["media_name", "path"] }
      );
      afterCarImages.forEach((img) => (result.after_car_image[img.media_name] = img.path));

      result.booking_paper = {};
      const bookingPapers = await MediaService.findAll(
        { target_table: db.booking.tableName, target_id: booking.id, target_type: "booking_paper" },
        { attributes: ["media_name", "path"] }
      );
      bookingPapers.forEach((img) => (result.booking_paper[img.media_name] = img.path));

      result.deposit_images = (
        await MediaService.findAll(
          { target_table: db.booking.tableName, target_id: booking.id, target_type: "deposit_image" },
          { attributes: ["path"] }
        )
      ).map((row) => row.path);

      delete result.id;

      return result;
    }
    return null;
  }

  updateByBookingId = async (bookingId, data, oldBooking) => {
    const bookingInput = filterBookingValues(data);
    await BookingService.updateById(bookingId, bookingInput, oldBooking);
    if (data.delivery_status) {
      const bookingSchedule = await oldBooking.getBooked_schedule();
      if (bookingSchedule) {
        bookingSchedule.delivery_status = data.delivery_status;
        await bookingSchedule.save();
      }
    }
  }
}

function filterBookingValues(data) {
  const allowValues = ['deposit', 'deposit_images', 'receive_note', 'return_note', 'give_user_id', 'return_user_id',
    'receive_etc_balance', 'return_etc_balance', 'receive_km', 'return_km', 'receive_fuel',
    'return_fuel', 'before_car_image', 'after_car_image',
  ];
  const result = {}
  for (const fieldName of allowValues) {
    if (data.hasOwnProperty(fieldName)) {
      result[fieldName] = data[fieldName];
    }
  }
  return result;
}

module.exports = new DeliveryTaskService();
