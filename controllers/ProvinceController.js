'use strict'

const slugify = require('slugify')
const Op = require('sequelize').Op
const ZoneService = require('../services/ZoneService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    data.level = 1;
    data.code = slugify(data.name, '-').toUpperCase();
    const checkExist = await ZoneService.getOne({ code: data.code, level: 1 })
    if (checkExist) {
      return resError(res, { message: 'Tên tỉnh thành đã được sử dụng', status: 409 })
    }
    const item = await ZoneService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await ZoneService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy tỉnh thành', status: 404 });
    }
    if (body.name && body.name !== item.name) {
      body.code = slugify(body.name, '-').toUpperCase();
      const checkExist = await ZoneService.getOne({
        code: body.code,
        level: 1,
        id: { [Op.ne]: id }
      })
      if (checkExist) {
        return resError(res, { message: 'Tên tỉnh thành đã được sử dụng', status: 409 })
      }
    }
    await ZoneService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    params.level = 1;
    const { rows, count } = await ZoneService.getAll(params);
    return resSuccess(res, { data: rows, extra: { total: count } });
  } catch (err) {
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await ZoneService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy tỉnh thành', status: 404 });
    }
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await ZoneService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy tỉnh thành', status: 404 });
    }
    await ZoneService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
