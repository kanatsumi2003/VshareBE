'use strict'

const VehicleBrandService = require('../services/VehicleBrandService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')
const { Op } = require('sequelize')
const { VEHICLE_TYPE_MOTOR } = require('../constants');

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await VehicleBrandService.getOne({ name: data.name, vehicle_type: data.vehicle_type })
    if (checkExist) {
      return resError(res, { message: 'Tên hãng xe đã tồn tại', status: 409 })
    }
    const item = await VehicleBrandService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await VehicleBrandService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy hãng xe', status: 404 });
    }
    if (body.name) {
      const checkExistName = await VehicleBrandService.getOne({
        name: body.name,
        vehicle_type: body.vehicle_type || item.vehicle_type,
        id: { [Op.ne]: id }
      })
      if (checkExistName) {
        return resError(res, { message: 'Tên hãng xe đã được sử dụng' })
      }
    }
    if (body.vehicle_type) {
      const checkExistType = await VehicleBrandService.getOne({
        name: body.name || item.name,
        vehicle_type: body.vehicle_type,
        id: { [Op.ne]: id }
      })
      if (checkExistType) {
        return resError(res, { message: 'Tên hãng xe đã được sử dụng đối với loại xe này' })
      }
    }
    await VehicleBrandService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query
    const { rows, count } = await VehicleBrandService.getAll(params);
    params.order = { position: 1 }
    let data = []
    if (count) {
      data = rows.map(row => ({ ...row.toJSON(), vehicle_type: row.vehicle_type == VEHICLE_TYPE_MOTOR ? 'Xe máy' : 'Ô tô' }))

    }
    return resSuccess(res, { data, extra: { total: count } });
  } catch (err) {
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params
    const brand = await VehicleBrandService.getById(id)
    if (!brand) {
      return resError(res, { message: 'Không tìm thấy hãng xe', status: 404 });
    }
    return resSuccess(res, { data: brand });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const brand = await VehicleBrandService.getById(id)
    if (!brand) {
      return resError(res, { message: 'Không tìm thấy hãng xe', status: 404 });
    }
    await VehicleBrandService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
