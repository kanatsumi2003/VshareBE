'use strict'

const { Op } = require('sequelize');

const VehicleModelService = require('../services/VehicleModelService');
const VehicleBrandService = require('../services/VehicleBrandService');
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil');
const db = require('../models');

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const brand = await VehicleBrandService.getById(data.brand_id);
    if (!brand) {
      return resError(res, { message: 'Hãng xe không tồn tại, brand_id không hợp lệ' })
    }
    const checkExist = await VehicleModelService.getOne({ name: data.name })
    if (checkExist) {
      return resError(res, { message: 'Tên hiệu xe đã được sử dụng', status: 409 })
    }
    const item = await VehicleModelService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await VehicleModelService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy hiệu xe', status: 404 });
    }
    if (body.brand_id) {
      const brand = await VehicleBrandService.getById(body.brand_id);
      if (!brand) {
        return resError(res, { message: 'Hãng xe không tồn tại, brand_id không hợp lệ' })
      }
    }
    if (body.name) {
      const checkExist = await VehicleModelService.getOne({ name: body.name, id: { [Op.ne]: id } })
      if (checkExist) {
        return resError(res, { message: 'Tên hiệu xe đã được sử dụng', status: 409 })
      }
    }
    await VehicleModelService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await VehicleModelService.getAll(params, { include: [{ model: db.vehicle_brand, require: true, attributes: ['name'] }] });
    let data = []
    if (count) {
      data = rows.map(row => {
        const item = { ...row.toJSON(), brand_name: row.vehicle_brand ? row.vehicle_brand.name : '' }
        delete item.vehicle_brand
        return item
      })
    }
    return resSuccess(res, { data, extra: { total: count } });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params
    const model = await VehicleModelService.getById(id)
    if (!model) {
      return resError(res, { message: 'Không tìm thấy hiệu xe', status: 404 });
    }
    return resSuccess(res, { data: model });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const model = await VehicleModelService.getById(id)
    if (!model) {
      return resError(res, { message: 'Không tìm thấy hiệu xe', status: 404 });
    }
    await VehicleModelService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
