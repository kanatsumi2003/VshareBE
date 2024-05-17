"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const CustomerService = require("../services/CustomerService");
const TrustScoreConfigService = require("../services/TrustScoreConfigService");
const BookingService = require("../services/BookingService");
const MediaService = require("../services/MediaService");
const { CustomerTrustScoreService } = require("../services");
const { success: resSuccess, error: resError } = require("../utils/ResponseUtil");
const { formatPhone0x, formatDatetimeOutput, formatListItemOutput, formatNumber } = require("../utils/FormatUtil");
const { formatVNDatetime } = require("../utils/DateUtil");
const db = require("../models");
const Constants = require("../constants");

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await CustomerService.getOne({ phone0x: formatPhone0x(data.phone) });
    if (checkExist) {
      return resError(res, { message: "Số điện thoại đã được sử dụng", status: 409 });
    }
    // const trust_scores = data.trust_scores || [];
    // if (trust_scores.length) {
    //   data.trust_score_configs = [];
    //   await Promise.all(
    //     trust_scores.map(async (trustScoreId) => {
    //       const trustScoreConfig = await TrustScoreConfigService.getById(trustScoreId);
    //       if (!trustScoreConfig) {
    //         throw new Error(`Không tìm thấy Điểm tin tưởng theo ID: ${trustScoreId}`);
    //       }
    //       data.trust_score_configs.push(trustScoreConfig);
    //     })
    //   );
    // }
    const item = await CustomerService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await CustomerService.getById(id);
    if (!item) {
      return resError(res, { message: "Không tìm thấy thông tin khách hàng", status: 404 });
    }
    if (body.phone) {
      const phone0x = formatPhone0x(body.phone);
      if (phone0x !== item.phone0x) {
        const checkExist = await CustomerService.getOne({ phone0x, id: { [Op.ne]: id } });
        if (checkExist) {
          return resError(res, { message: "Số điện thoại đã được sử dụng", status: 409 });
        }
      }
      body.phone0x = phone0x;
    }
    // const trust_scores = body.trust_scores;
    // if (Array.isArray(trust_scores)) {
    //   body.trust_score_configs = [];
    //   await Promise.all(
    //     trust_scores.map(async (trustScoreId) => {
    //       const trustScoreConfig = await TrustScoreConfigService.getById(trustScoreId);
    //       if (!trustScoreConfig) {
    //         throw new Error(`Không tìm thấy Điểm tin tưởng theo ID: ${trustScoreId}`);
    //       }
    //       body.trust_score_configs.push(trustScoreConfig);
    //     })
    //   );
    // }
    await CustomerService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const params = req.query,
      whereBooking = {};

    if (params.booking_code || params.bookings) {
      whereBooking.code = {
        [Op.like]: `%${params.booking_code || params.bookings}%`,
      };
      delete params.booking_code;
      delete params.bookings;
    }

    const include = [
      {
        model: db.booking,
        attributes: ["code", "id", "level"],
        required: Object.keys(whereBooking).length > 0,
        group: ["customer_id"],
        where: whereBooking,
      },
    ];

    const { rows, count } = await CustomerService.getAll(params, {
      attributes: ["id", "fullname", "phone", "email", "address", "profile_status", "number_success_booking"],
      include,
    });
    return resSuccess(res, { data: rows, extra: { total: count } });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
};

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CustomerService.getDetail(id);
    if (!item) {
      return resError(res, { message: "Không tìm thấy thông tin khách hàng", status: 404 });
    }
    const data = formatDatetimeOutput({ ...item, ...item.other_data });
    delete data.other_data;
    return resSuccess(res, { data });
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CustomerService.getById(id);
    if (!item) {
      return resError(res, { message: "Không tìm thấy thông tin khách hàng", status: 404 });
    }
    await CustomerService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const item = await CustomerService.getByPhone(phone);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resSuccess(res, { data: null });
  }
};

exports.customerGetProfile = async (req, res) => {
  try {
    const { sub } = req.user;
    let data = await CustomerService.getById(sub);
    if (data) {
      data = data.toJSON();
      delete data.password;
      delete data.phone0x;

      data.customer_image = {};
      const customerImages = await MediaService.findAll(
        { target_table: db.customer.tableName, target_id: sub, target_type: "customer_image" },
        { attributes: ["media_name", "path"] }
      );
      console.log(customerImages);
      customerImages.forEach((img) => (data.customer_image[img.media_name] = img.path));
      data.customer_other_document_files = (
        await MediaService.findAll(
          {
            target_table: db.customer.tableName,
            target_id: sub,
            target_type: "customer_other_document",
          },
          { attributes: ["path"] }
        )
      ).map((row) => row.path);

      return resSuccess(res, { data });
    }
    return resError(res, { status: 404, message: 'Không tìm thấy thông tin tài khoản' });
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.customerUpdateProfile = async (req, res) => {
  try {
    const { sub } = req.user;
    await CustomerService.updateById(sub, req.body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const params = req.query;
    const { id: customer_id } = req.params;
    const { rows, count } = await BookingService.getAll({ ...params, customer_id });
    let data = [], totalAmount = 0, totalSuccess = 0;
    if (count) {
      data = rows.map((row) => {
        if (row.level == "L8" || row.level == "L9") {
          totalAmount += row.actual_price;
          totalSuccess++;
        }
        return {
          id: row.id,
          code: row.code,
          estimate_branch_vehicle_id: row.estimate_branch_vehicle ? row.estimate_branch_vehicle.name : "",
          actual_branch_vehicle_id: row.actual_branch_vehicle ? row.actual_branch_vehicle.name : "",
          branch_id: row.branch ? row.branch.name : "",
          fullname: row.customer ? row.customer.fullname : "",
          phone: row.customer ? row.customer.phone : "",
          email: row.customer ? row.customer.email : "",
          price: formatListItemOutput(formatNumber(row.estimate_price), formatNumber(row.actual_price)),
          receive_datetime: formatListItemOutput(
            row.estimate_receive_datetime ? formatVNDatetime(row.estimate_receive_datetime, "YYYY-MM-DD HH:mm") : "",
            row.actual_receive_datetime ? formatVNDatetime(row.actual_receive_datetime, "YYYY-MM-DD HH:mm") : ""
          ),
          return_datetime: formatListItemOutput(
            row.estimate_return_datetime ? formatVNDatetime(row.estimate_return_datetime, "YYYY-MM-DD HH:mm") : "",
            row.actual_return_datetime ? formatVNDatetime(row.actual_return_datetime, "YYYY-MM-DD HH:mm") : ""
          ),
          rental_duration: formatListItemOutput(row.estimate_rental_duration, row.actual_rental_duration),
          source: row.source,
          level: row.level,
          booking_status: (row.booking_status || Constants.BOOKING_STATUS_PENDING).toString(),
        }
      });
    }
    return resSuccess(res, { data, extra: { total: count, totalAmount, totalSuccess } });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.getCustomerTrustScores = async (req, res) => {
  try {
    const { id: customer_id } = req.params;
    const trustScores = await TrustScoreConfigService.findAll({
      parent_id: null,
    }, {
      attributes: ['id', 'name'],
      include: [
        { model: db.trust_score_config, as: 'trust_scores', attributes: ['id', 'name', 'point'] }
      ]
    });
    let data = trustScores, total = 0;
    if (trustScores.length) {
      const selecteds = await CustomerTrustScoreService.findAll({ customer_id }, {
        attributes: ['trust_score_config_id', 'note'],
        raw: true,
      })
      if (selecteds.length) {
        data = trustScores.map(row => {
          const item = row.toJSON();
          if (item.trust_scores.length) {
            item.trust_scores = row.toJSON().trust_scores.map(row2 => {
              const selected = selecteds.find(s => s.trust_score_config_id === row2.id);
              if (selected) total += row2.point;

              return {
                ...row2,
                selected: !!selected,
                note: selected ? selected.note : ''
              }
            })
          }
          return item;
        })
      }
    }
    return resSuccess(res, { data, extra: { total } });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.upsertCustomerTrustScores = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id: customer_id } = req.params;
    const { trust_scores } = req.body;
    await CustomerTrustScoreService.delete({ customer_id }, { transaction: t });
    if (trust_scores.length) {
      await CustomerTrustScoreService.batchCreate(trust_scores.map(row => ({
        customer_id,
        trust_score_config_id: row.id,
        note: row.note,
      })), { transaction: t });
    }
    await t.commit();
    return resSuccess(res);
  } catch (err) {
    await t.rollback();
    console.error(err);
    return resError(res, { message: err.message });
  }
}
