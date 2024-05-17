"use strict";

const Op = require("sequelize").Op;
const VehiclePriceService = require("../services/VehiclePriceService");
const PriceRuleService = require("../services/CustomerDayPriceRuleService");
const { success: resSuccess, error: resError } = require("../utils/ResponseUtil");
const db = require("../models");

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    if (!PriceRuleService.isValidCustomerDayPriceRules(data.customer_day_price_rules || [])) {
      throw new Error("Cấu hình giá theo ngày bị trùng lặp hoặc sai thứ tự");
    }
    const item = await VehiclePriceService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await VehiclePriceService.getById(id);
    if (!item) {
      return resError(res, { message: "Không tìm thấy cấu hình giá", status: 404 });
    }
    if (
      (body.branch_id && body.branch_id != item.branch_id) ||
      (body.vehicle_class && body.vehicle_class != item.vehicle_class)
    ) {
      const checkExist = await VehiclePriceService.getOne({
        branch_id: body.branch_id || item.branch_id,
        vehicle_class: body.vehicle_class || item.vehicle_class,
        id: { [Op.ne]: id },
      });
      if (checkExist) {
        return resError(res, { message: "Cấu hình giá đã tồn tại", status: 409 });
      }
    }
    // Check valid customer_day_price_rules
    if (!PriceRuleService.isValidCustomerDayPriceRules(body.customer_day_price_rules || [])) {
      throw new Error("Cấu hình giá theo ngày bị trùng lặp hoặc sai thứ tự");
    }
    await VehiclePriceService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await VehiclePriceService.getAll(params, {
      include: { model: db.branch, attributes: ["name"] },
    });
    let data = [];
    if (count) {
      data = rows.map((row) => {
        const item = { ...row.toJSON(), branch_name: row.branch ? row.branch.name : "" };
        delete item.deleted_at;
        delete item.branch;
        return item;
      });
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
    const item = await VehiclePriceService.getById(id);
    if (!item) {
      return resError(res, { message: "Không tìm thấy cấu hình giá", status: 404 });
    }
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await VehiclePriceService.getById(id);
    if (!item) {
      return resError(res, { message: "Không tìm thấy cấu hình giá cần xóa", status: 404 });
    }
    await VehiclePriceService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
};
