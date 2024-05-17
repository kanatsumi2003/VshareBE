/* eslint-disable indent */
"use strict";

const moment = require("moment");
const momentTz = require("moment-timezone");
const Op = require("sequelize").Op;
const { getVehicleNameCode } = require("../helpers/SystemConfigHelper");
const { customDatetimeFormat } = require("../utils/DateUtil");
const { buildQuery } = require("../helpers/QueryHelper");
const db = require("../models");
const constants = require("../constants");
const AbstractBaseService = require("./AbstractBaseService");
const CustomerService = require("./CustomerService");
const MediaService = require("./MediaService");
const BranchVehicleService = require("./BranchVehicleService");
const BookedScheduleService = require("./BookedScheduleService");

function filterBookingAtrributes(data) {
  const booking = {};
  Object.keys(db.booking.rawAttributes).forEach((fieldKey) => {
    if (typeof data[fieldKey] != "undefined") {
      switch (fieldKey) {
        case "estimate_receive_datetime":
        case "actual_receive_datetime":
        case "estimate_return_datetime":
        case "actual_return_datetime":
          booking[fieldKey] = data[fieldKey]
            ? moment(data[fieldKey], "YYYY-MM-DD HH:mm", true).isValid()
              ? momentTz.tz(data[fieldKey], "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh").format()
              : momentTz(data[fieldKey]).tz("Asia/Ho_Chi_Minh").format()
            : null;
          break;

        default:
          booking[fieldKey] = data[fieldKey];
          break;
      }
    }
  });
  if (!data.level) {
    if (data.prepay) {
      if (data.approve_status == constants.APPROVE_STATUS_PASSED) {
        booking.level = "L6";
      } else {
        booking.level = "L5";
      }
    } else if (data.estimate_branch_vehicle_id) {
      booking.level = "L4";
    }
  }
  if (data.add_ons) {
    booking.total_addon_amount = data.add_ons.length ? data.add_ons.reduce((a, b) => a + b.cost, 0) : 0;
  }
  return booking;
}

function filterOtherFields(data) {
  const otherFields = {};
  const keys = [
    "hold_customer_note",
    "receive_vehicle_status",
    "return_vehicle_status",
    "contract_sign_date",
    "contract_created_by",
    "estimate_deposit_paper",
    "estimate_deposit_asset",
    "receive_km",
    "return_km",
    "receive_fuel",
    "return_fuel",
    "receive_etc_balance",
    "return_etc_balance",
    "reason_rental",
    "estimate_prepay",
    "estimate_discount_amount",
    "remain_amount",
    "receive_address",
    "vehicle_full",
    "approve_by",
    "approve_username", // Save for exporting
    "approve_fullname", // Save for exporting
    "trust_score",
    "approve_status",
    "booked_status",
    "return_customer_assets",
    "hold_customer_return_date",
    "hold_customer_reason",
    "return_vehicle_same",
    "final_note",
    "customer_request_note",
    "receive_note",
    "return_note",
    "estimate_add_ons",
    "estimate_after_discount_amount",
    "estimate_total_addon_amount",
    "estimate_total_amount",
    "estimate_delivery_fee",
    "estimate_vat_cost",
    "contract_receive_datetime",
    "contract_return_datetime",
    "contract_rental_duration",
    "liquid_total_addon",
    "liquid_total_amount",
    "liquid_total_amount_after_settlement",
    "liquid_paid_amount",
    "liquid_total_amount_left",
  ];
  keys.forEach((key) => {
    if (typeof data[key] != "undefined") otherFields[key] = data[key];
  });
  if (!otherFields.booked_status) {
    if (data.level == 'L8' || data.booking_status == constants.BOOKING_STATUS_RUNNING) {
      otherFields.booked_status = constants.BOOKED_STATUS_PAID100;
    }
    else if (['L5', 'L6', 'L7'].includes(data.level) || data.prepay) {
      otherFields.booked_status = constants.BOOKED_STATUS_DEPOSIT;
    }
  }
  return otherFields;
}

// Retrieve the booking status based on the input data
function getBookingStatus(data, defaultStatus = constants.BOOKING_STATUS_PENDING) {
  if (data.actual_return_datetime || data.returned) {
    return constants.BOOKING_STATUS_RETURNED;
  } else if (data.actual_receive_datetime) {
    return constants.BOOKING_STATUS_RECEIVED;
  } else if (data.approve_status) {
    return constants.BOOKING_STATUS_APPROVED;
  } else if (data.prepay) {
    return constants.BOOKING_STATUS_PREPAID;
  }
  return defaultStatus;
}

class BookingService extends AbstractBaseService {
  constructor() {
    super(db.booking);
  }

  getAll = (params) => {
    const
      query = buildQuery(params),
      actualBranchVehicleWhere = {},
      estimateBranchVehicleWhere = {};

    Object.entries(params).forEach(([k, v]) => {
      if (v.indexOf(',') > -1) {
        query.where[k] = {
          [Op.in]: v.split(',')
        }
      }
    });

    if (params.receive_datetime_from && params.receive_datetime_to) {
      query.where.estimate_receive_datetime = {
        [Op.between]: [
          params.receive_datetime_from,
          momentTz.tz(params.receive_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
        ],
      };
    } else if (params.receive_datetime_from) {
      query.where.estimate_receive_datetime = {
        [Op.gte]: params.receive_datetime_from,
      };
    } else if (params.receive_datetime_to) {
      query.where.estimate_receive_datetime = {
        [Op.lte]: momentTz.tz(params.receive_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
      };
    }
    delete query.where.receive_datetime_from;
    delete query.where.receive_datetime_to;

    if (params.return_datetime_from && params.return_datetime_to) {
      query.where.estimate_return_datetime = {
        [Op.between]: [
          params.return_datetime_from,
          momentTz.tz(params.return_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
        ],
      };
    } else if (params.return_datetime_from) {
      query.where.estimate_return_datetime = {
        [Op.gte]: params.return_datetime_from,
      };
    } else if (params.return_datetime_to) {
      query.where.estimate_return_datetime = {
        [Op.lte]: momentTz.tz(params.return_datetime_to, "Asia/Ho_Chi_Minh").endOf("day"),
      };
    }
    delete query.where.return_datetime_from;
    delete query.where.return_datetime_to;

    return this.model.findAndCountAll({
      ...query,
      attributes: [
        "id",
        "code",
        "phone",
        "fullname",
        "email",
        "estimate_price",
        "actual_price",
        "estimate_branch_vehicle_id",
        "actual_branch_vehicle_id",
        "estimate_receive_datetime",
        "estimate_return_datetime",
        "estimate_rental_duration",
        "actual_receive_datetime",
        "actual_return_datetime",
        "actual_rental_duration",
        "source",
        "level",
        "booking_status",
      ],
      include: [
        { model: db.branch, attributes: ["name"] },
        {
          model: db.branch_vehicle,
          as: "estimate_branch_vehicle",
          attributes: ["name"],
          where: estimateBranchVehicleWhere,
          required: false,
        },
        {
          model: db.branch_vehicle,
          as: "actual_branch_vehicle",
          attributes: ["name"],
          where: actualBranchVehicleWhere,
          required: false,
        },
      ],
    });
  };

  create = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      // Create customer
      const customer = await CustomerService.upsertOne(data, data.customer_id, t);
      data.customer_id = customer.id;
      // Save other data
      data.other = filterOtherFields(data);

      // Create booking
      const bookingValues = filterBookingAtrributes(data);
      bookingValues.booking_status = getBookingStatus(bookingValues);
      const booking = await this.model.create(bookingValues, { transaction: t });
      const branchVehicleData = {};

      // Create other costs
      if (data.other_costs) {
        const otherCosts = data.other_costs.map(c => ({ booking_id: booking.id, ...c }));
        await db.booking_other_cost.bulkCreate(otherCosts, { transaction: t });
        booking.other_cost = data.other_costs.reduce((a, b) => a + b.cost, 0);
      }
      if (data.operation_costs) {
        const operationCosts = data.operation_costs.map(c => ({ booking_id: booking.id, type: 'pre', ...c }));
        await db.booking_operation_cost.bulkCreate(operationCosts, { transaction: t });
        booking.operation_cost = data.operation_costs.reduce((a, b) => a + b.cost, 0);
      }
      if (data.post_operation_costs) {
        const operationCosts = data.post_operation_costs.map(c => ({ booking_id: booking.id, type: 'post', ...c }));
        await db.booking_operation_cost.bulkCreate(operationCosts, { transaction: t });
        booking.post_operation_cost = data.post_operation_costs.reduce((a, b) => a + b.cost, 0);
      }

      booking.save({ transaction: t, individualHooks: true });

      if (data.add_ons && data.add_ons.length) {
        data.total_addon_amount = data.add_ons.reduce((a, b) => a + b.cost, 0);
      }
      await BookedScheduleService.setupBookedSchedule(booking.id, bookingValues, { transaction: t });
      // Save customer image paths
      if (data.customer_image) {
        await MediaService.saveMedia(customer.id, data.customer_image, "customer_image", db.customer.tableName, {
          transaction: t,
        });
      }
      // Save customer other documents
      if (data.customer_other_document_files && data.customer_other_document_files.length) {
        const customerOtherDocuments = {};
        data.customer_other_document_files.forEach((img, i) => (customerOtherDocuments[i] = img));
        await MediaService.saveMedia(
          customer.id,
          customerOtherDocuments,
          "customer_other_document",
          db.customer.tableName,
          { transaction: t }
        );
      }
      // Save car image paths
      if (data.before_car_image) {
        await MediaService.saveMedia(booking.id, data.before_car_image, "before_car_image", this.tableName, {
          transaction: t,
        });
      }
      // Save car image paths
      if (data.after_car_image) {
        await MediaService.saveMedia(booking.id, data.after_car_image, "after_car_image", this.tableName, {
          transaction: t,
        });
        if (bookingValues.actual_branch_vehicle_id) {
          await MediaService.saveMedia(
            bookingValues.actual_branch_vehicle_id,
            data.after_car_image,
            "latest_car_image",
            db.branch_vehicle.tableName,
            { transaction: t }
          );
          branchVehicleData.latest_car_image = data.after_car_image;
        }
      }
      // Save booking paper paths
      if (data.booking_paper) {
        await MediaService.saveMedia(booking.id, data.booking_paper, "booking_paper", this.tableName, {
          transaction: t,
        });
      }
      // Save contract images
      if (data.booking_contract_images && data.booking_contract_images.length) {
        const bookingContractImage = {};
        data.booking_contract_images.forEach((img, i) => (bookingContractImage[i] = img));
        await MediaService.saveMedia(booking.id, bookingContractImage, "booking_contract_image", this.tableName, {
          transaction: t,
        });
      }
      // Save deposit images
      if (data.deposit_images && data.deposit_images.length) {
        const depositImage = {};
        data.deposit_images.forEach((img, i) => (depositImage[i] = img));
        await MediaService.saveMedia(booking.id, depositImage, "deposit_image", this.tableName, { transaction: t });
      }
      if ((data.return_etc_balance || data.receive_etc_balance) && data.actual_branch_vehicle_id) {
        await db.branch_vehicle.update(
          { etc_balance: data.return_etc_balance || data.receive_etc_balance },
          { where: { id: data.actual_branch_vehicle_id }, transaction: t }
        );
      }
      if (Object.keys(branchVehicleData).length) {
        if (data.return_km) branchVehicleData.latest_km = data.return_km;
        if (data.return_fuel) branchVehicleData.latest_fuel = data.return_fuel;
        await BranchVehicleService.updateOtherData(bookingValues.actual_branch_vehicle_id, branchVehicleData, {
          transaction: t,
        });
      }
      await t.commit();
      // Update total successful booking
      if (["L8", "L9"].includes(booking.level)) {
        CustomerService.updateSuccessBookingNumber(booking.customer_id);
      }
      return booking;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  updateById = async (id, data, oldBooking = {}) => {
    const t = await db.sequelize.transaction();
    try {
      // Update customer
      const customer = await CustomerService.upsertOne(data, data.customer_id || oldBooking.customer_id, t);
      data.customer_id = customer.id;
      // Update booking
      // Save other data
      data.other = { ...oldBooking.other, ...filterOtherFields(data) };
      const bookingValues = filterBookingAtrributes({ level: oldBooking.level, ...data });
      bookingValues.booking_status = data.booking_status || getBookingStatus(
        { ...oldBooking, ...oldBooking.other, ...bookingValues, ...bookingValues.other },
        oldBooking.booking_status || bookingValues.booking_status,
      );

      // Overlap deposit
      if (data.deposit) {
        bookingValues.deposit = { ...oldBooking.deposit, ...data.deposit }
      }

      // Create other costs
      if (data.other_costs) {
        await db.booking_other_cost.destroy({ where: { booking_id: id }, transaction: t });
        const otherCosts = data.other_costs.map(c => ({ booking_id: id, ...c }));
        await db.booking_other_cost.bulkCreate(otherCosts, { transaction: t });
        bookingValues.other_cost = data.other_costs.reduce((a, b) => a + b.cost, 0);
      }
      if (data.operation_costs) {
        await db.booking_operation_cost.destroy({ where: { booking_id: id, type: 'pre' }, transaction: t });
        const operationCosts = data.operation_costs.map(c => ({ booking_id: id, type: 'pre', ...c }));
        await db.booking_operation_cost.bulkCreate(operationCosts, { transaction: t });
        bookingValues.operation_cost = data.operation_costs.reduce((a, b) => a + b.cost, 0);
      }
      if (data.post_operation_costs) {
        await db.booking_operation_cost.destroy({ where: { booking_id: id, type: 'post' }, transaction: t });
        const operationCosts = data.post_operation_costs.map(c => ({ booking_id: id, type: 'post', ...c }));
        await db.booking_operation_cost.bulkCreate(operationCosts, { transaction: t });
        bookingValues.post_operation_cost = data.post_operation_costs.reduce((a, b) => a + b.cost, 0);
      }

      // Save booking values
      console.log(bookingValues, id);
      await this.model.update(bookingValues, {
        where: { id },
        individualHooks: true,
        transaction: t,
      });

      await BookedScheduleService.setupBookedSchedule(id, { ...oldBooking, ...bookingValues }, { transaction: t });
      // Save customer image paths
      if (data.customer_image) {
        await MediaService.saveMedia(customer.id, data.customer_image, "customer_image", db.customer.tableName, {
          transaction: t,
        });
      }
      // Save customer other documents
      if (data.customer_other_document_files) {
        const customerOtherDocuments = {};
        data.customer_other_document_files.forEach((img, i) => (customerOtherDocuments[i] = img));
        await MediaService.saveMedia(
          customer.id,
          customerOtherDocuments,
          "customer_other_document",
          db.customer.tableName,
          { transaction: t }
        );
      }
      // Save car image paths
      if (data.before_car_image) {
        await MediaService.saveMedia(id, data.before_car_image, "before_car_image", this.tableName, { transaction: t });
      }
      // Save car image paths
      if (data.after_car_image) {
        await MediaService.saveMedia(id, data.after_car_image, "after_car_image", this.tableName, { transaction: t });
        const actualBranchVehicleId = data.actual_branch_vehicle_id || oldBooking.actual_branch_vehicle_id;
        if (actualBranchVehicleId) {
          await MediaService.saveMedia(
            actualBranchVehicleId,
            data.after_car_image,
            "latest_car_image",
            db.branch_vehicle.tableName,
            { transaction: t }
          );
        }
      }
      // Save booking paper paths
      if (data.booking_paper) {
        await MediaService.saveMedia(id, data.booking_paper, "booking_paper", this.tableName, { transaction: t });
      }
      // Save contract images
      if (data.booking_contract_images && data.booking_contract_images.length) {
        const bookingContractImage = {};
        data.booking_contract_images.forEach((img, i) => (bookingContractImage[i] = img));
        await MediaService.saveMedia(id, bookingContractImage, "booking_contract_image", this.tableName, {
          transaction: t,
        });
      }
      // Save deposit images
      if (data.deposit_images && data.deposit_images.length) {
        const depositImage = {};
        data.deposit_images.forEach((img, i) => (depositImage[i] = img));
        await MediaService.saveMedia(id, depositImage, "deposit_image", this.tableName, { transaction: t });
      }
      if ((data.return_etc_balance || data.receive_etc_balance) && data.actual_branch_vehicle_id) {
        await db.branch_vehicle.update(
          { etc_balance: data.return_etc_balance || data.receive_etc_balance },
          { where: { id: data.actual_branch_vehicle_id }, transaction: t }
        );
      }
      // Update actual branch vehicle data
      const branchVehicleData = {},
        actualBranchVehicleId = data.actual_branch_vehicle_id || oldBooking.actual_branch_vehicle_id;
      if (actualBranchVehicleId) {
        if (data.after_car_image) branchVehicleData.latest_car_image = data.after_car_image;
        if (data.return_km) branchVehicleData.latest_km = data.return_km;
        if (data.return_fuel) branchVehicleData.latest_fuel = data.return_fuel;
        if (Object.keys(branchVehicleData).length) {
          await BranchVehicleService.updateOtherData(actualBranchVehicleId, branchVehicleData, { transaction: t });
        }
      }
      if (["L8", "L9"].includes(data.level)) {
        await CustomerService.updateSuccessBookingNumber(data.customer_id, { transaction: t });
      }
      // Update corresponding delivery task
      await _updateDeliveryTask(data, oldBooking, { transaction: t });

      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  getOne = async (params, options = {}) => {
    const item = await this.model.findOne({ where: { ...params } });
    if (item) {
      let data = item.toJSON();
      delete data.deleted_at;

      // Format datetime fields
      if (data.estimate_receive_datetime)
        data.estimate_receive_datetime = customDatetimeFormat(data.estimate_receive_datetime, "YYYY-MM-DD HH:mm");
      if (data.actual_receive_datetime)
        data.actual_receive_datetime = customDatetimeFormat(data.actual_receive_datetime, "YYYY-MM-DD HH:mm");
      if (data.estimate_return_datetime)
        data.estimate_return_datetime = customDatetimeFormat(data.estimate_return_datetime, "YYYY-MM-DD HH:mm");
      if (data.actual_return_datetime)
        data.actual_return_datetime = customDatetimeFormat(data.actual_return_datetime, "YYYY-MM-DD HH:mm");

      const customer = await item.getCustomer({
        attributes: {
          exclude: [
            "id",
            "phone0x",
            "phone",
            "fullname",
            "email",
            "password",
            "created_at",
            "updated_at",
            "deleted_at",
          ]
        },
      });
      if (customer) {
        Object.entries(customer.toJSON()).forEach(([key, val]) => (data[key] = val));
      }
      data.other_costs = await item.getBooking_other_costs({ attributes: ["cost", "code", "note"] });
      data.operation_costs = await item.getBooking_operation_costs({ where: { type: 'pre' }, attributes: ["cost", "code", "note"] });
      data.post_operation_costs = await item.getBooking_operation_costs({ where: { type: 'post' }, attributes: ["cost", "code", "note"] });

      data.estimate_branch_vehicle = await item.getEstimate_branch_vehicle();
      if (item.estimate_branch_vehicle_id == item.actual_branch_vehicle_id) {
        data.actual_branch_vehicle = data.estimate_branch_vehicle;
      } else {
        data.actual_branch_vehicle = await item.getActual_branch_vehicle();
      }
      if (options.includeBranch) {
        data.branch = await db.branch.findOne({ where: { id: data.branch_id } });
      }
      if (options.includeVehicle) {
        data.vehicle = await db.vehicle.findOne({
          where: {
            id: data.actual_branch_vehicle
              ? data.actual_branch_vehicle.vehicle_id
              : data.estimate_branch_vehicle.vehicle_id,
          },
        });
      }
      if (data.other) {
        Object.entries(data.other).forEach(([key, value], _) => (data[key] = value));
        if (typeof data.receive_km === 'undefined') data.receive_km = null;
        if (typeof data.return_km === 'undefined') data.return_km = null;
        if (typeof data.receive_fuel === 'undefined') data.receive_fuel = null;
        if (typeof data.return_fuel === 'undefined') data.return_fuel = null;
        delete data.other;
      }
      if (data.deposit && Object.keys(data.deposit).length) {
        Object.entries(data.deposit)
          .forEach(([key, value], _) =>
            data.deposit[key] = key.endsWith('_returned') ? !value ? false : true : value
          );
      }
      else {
        data.deposit = constants.DEPOSIT_DEFAULT;
      }
      if (!data.vat || !Object.keys(data.vat).length) {
        data.vat = constants.VAT_DEFAULT;
      }
      if (params.id) {
        data.customer_image = {};
        const customerImages = await MediaService.findAll(
          { target_table: db.customer.tableName, target_id: data.customer_id, target_type: "customer_image" },
          { attributes: ["media_name", "path"] }
        );
        customerImages.forEach((img) => (data.customer_image[img.media_name] = img.path));
        data.customer_other_document_files = (
          await MediaService.findAll(
            {
              target_table: db.customer.tableName,
              target_id: data.customer_id,
              target_type: "customer_other_document",
            },
            { attributes: ["path"] }
          )
        ).map((row) => row.path);
        data.before_car_image = {};
        const beforeCarImages = await MediaService.findAll(
          { target_table: this.tableName, target_id: params.id, target_type: "before_car_image" },
          { attributes: ["media_name", "path"] }
        );
        beforeCarImages.forEach((img) => (data.before_car_image[img.media_name] = img.path));
        data.after_car_image = {};
        const afterCarImages = await MediaService.findAll(
          { target_table: this.tableName, target_id: params.id, target_type: "after_car_image" },
          { attributes: ["media_name", "path"] }
        );
        afterCarImages.forEach((img) => (data.after_car_image[img.media_name] = img.path));
        data.booking_paper = {};
        const bookingPapers = await MediaService.findAll(
          { target_table: this.tableName, target_id: params.id, target_type: "booking_paper" },
          { attributes: ["media_name", "path"] }
        );
        bookingPapers.forEach((img) => (data.booking_paper[img.media_name] = img.path));
        data.booking_contract_images = (
          await MediaService.findAll(
            { target_table: this.tableName, target_id: params.id, target_type: "booking_contract_image" },
            { attributes: ["path"] }
          )
        ).map((row) => row.path);
        data.deposit_images = (
          await MediaService.findAll(
            { target_table: this.tableName, target_id: params.id, target_type: "deposit_image" },
            { attributes: ["path"] }
          )
        ).map((row) => row.path);
      }
      return data;
    }
    return null;
  };

  deleteById = async (id) => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.destroy({ where: { id }, transaction: t });
      await db.media.destroy({ where: { target_table: this.tableName, target_id: id }, transaction: t });
      await db.booking_other_cost.destroy({ where: { booking_id: id }, transaction: t, force: true });
      await db.booked_schedule.destroy({ where: { booking_id: id }, transaction: t });
      return await t.commit();
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  // logic for generating booking code
  genBookingCode = async (
    branchCode,
    vehicleType = constants.VEHICLE_TYPE_CAR,
    service = constants.BOOKING_SERVICE_RENTAL_CAR,
    numberDigits = 3
  ) => {
    const prefix = `${branchCode}${getVehicleNameCode(vehicleType)}${service}`.toUpperCase();
    const date = moment().tz("Asia/Ho_Chi_Minh").format("YYMMDD");
    const booking = await db.booking.findOne({
      where: {
        code: { [Op.like]: `${prefix}${date}%` },
        [Op.and]: [db.sequelize.literal("LENGTH(REPLACE(code, '" + `${prefix}${date}` + "', '')) = " + numberDigits)],
      },
      order: [db.sequelize.literal("LENGTH(code) DESC"), ["code", "DESC"]],
      attributes: ["code"],
    });
    let index = 0;
    if (booking && booking.code) {
      index = parseInt(booking.code.slice(prefix.length + 6)) + 1;
    } else {
      index = 1;
    }
    const ordering = index.toString().padStart(numberDigits, "0");
    return `${prefix}${date}${ordering}`;
  };

  getCustomerBookings = async (params) => {
    return db.booking.findAndCountAll({
      attributes: [
        "id",
        "code",
        "estimate_receive_datetime",
        "estimate_return_datetime",
        "actual_receive_datetime",
        "actual_return_datetime",
        "level",
        "booking_status",
        "payment_method",
        "estimate_price",
        "actual_price",
      ],
      where: { ...params },
      include: [
        {
          model: db.branch_vehicle,
          as: "estimate_branch_vehicle",
          attributes: [],
          required: true,
          include: [{
            model: db.vehicle, attributes: ['name', 'version', 'image']
          }]
        },
        {
          model: db.branch_vehicle,
          as: "actual_branch_vehicle",
          attributes: [],
          required: false,
          include: [{
            model: db.vehicle, attributes: ['name', 'version', 'image']
          }]
        },
      ],
      raw: true
    })
  }
}

async function _updateDeliveryTask(data, oldBooking, options) {
  const isChangeVehicle = (data.actual_branch_vehicle_id && data.actual_branch_vehicle_id != oldBooking.actual_branch_vehicle_id)
    || (data.estimate_branch_vehicle_id && data.estimate_branch_vehicle_id != oldBooking.estimate_branch_vehicle_id);
  const isChangeReceiveDatetime = (data.estimate_receive_datetime && data.estimate_receive_datetime != oldBooking.estimate_receive_datetime)
    || (data.actual_receive_datetime && data.actual_receive_datetime != oldBooking.actual_receive_datetime);
  const isChangeReturnDatetime = (data.estimate_return_datetime && data.estimate_return_datetime != oldBooking.estimate_return_datetime)
    || (data.actual_return_datetime && data.actual_return_datetime != oldBooking.actual_return_datetime);

  const branchVehicleId = data.actual_branch_vehicle_id || oldBooking.actual_branch_vehicle_id || data.estimate_branch_vehicle_id || oldBooking.estimate_branch_vehicle_id;

  if (isChangeReceiveDatetime || isChangeVehicle || data.give_user_id) {
    const query = {
      booking_id: oldBooking.id,
      task_type: constants.TASK_TYPE_RECEIVE,
    }
    let receiveTask = await db.delivery_task.findOne({ where: query })
    if (!receiveTask) {
      receiveTask = await db.delivery_task.create(query, { ...options })
    }
    if (isChangeReceiveDatetime) {
      receiveTask.do_at = data.actual_receive_datetime
        || oldBooking.actual_receive_datetime
        || data.estimate_receive_datetime
        || oldBooking.estimate_receive_datetime;
    }
    if (isChangeVehicle) {
      receiveTask.branch_vehicle_id = branchVehicleId
    }
    if (data.give_user_id && data.give_user_id != receiveTask.user_id) {
      receiveTask.user_id = data.give_user_id;
    }
    await receiveTask.save({ ...options })
  }
  if (isChangeReturnDatetime || isChangeVehicle || data.return_user_id) {
    const query = {
      booking_id: oldBooking.id,
      task_type: constants.TASK_TYPE_RETURN,
    }
    let returnTask = await db.delivery_task.findOne({ where: query })
    if (!returnTask) {
      returnTask = await db.delivery_task.create(query, { ...options })
    }
    if (isChangeReturnDatetime) {
      returnTask.do_at = data.actual_return_datetime
        || oldBooking.actual_return_datetime
        || data.estimate_return_datetime
        || oldBooking.estimate_return_datetime;
    }
    if (isChangeVehicle) {
      returnTask.branch_vehicle_id = branchVehicleId;
    }
    if (data.return_user_id && data.return_user_id != returnTask.user_id) {
      returnTask.user_id = data.return_user_id;
    }
    await returnTask.save({ ...options })
  }
}

module.exports = new BookingService();
