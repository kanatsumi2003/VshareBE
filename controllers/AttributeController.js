'use strict'

const Op = require('sequelize').Op
const AttributeService = require('../services/AttributeService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await AttributeService.getOne({ name: data.name })
    if (checkExist) {
      return resError(res, { message: 'Tên thuộc tính đã được sử dụng', status: 409 })
    }
    const item = await AttributeService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const data = body;
    const item = await AttributeService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thuộc tính', status: 404 });
    }
    if (data.name && data.name != item.name) {
      const checkExist = await AttributeService.getOne({
        name: data.name,
        id: { [Op.ne]: id }
      })
      if (checkExist) {
        return resError(res, { message: 'Tên thuộc tính đã được sử dụng', status: 409 })
      }
    }
    await AttributeService.updateById(id, data);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await AttributeService.getAll(params);
    return resSuccess(res, { data: rows, extra: { total: count } });
  } catch (err) {
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await AttributeService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thuộc tính', status: 404 });
    }
    const data = item.toJSON();
    return resSuccess(res, { data });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await AttributeService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thuộc tính', status: 404 });
    }
    await AttributeService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
