'use strict'

const PromotionEventService = require('../services/PromotionEventService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await PromotionEventService.getOne({ name: data.name })
    if (checkExist) {
      return resError(res, { message: 'name already existed', status: 409 })
    }
    const item = await PromotionEventService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await PromotionEventService.getById(id)
    if (!item) {
      return resError(res, { message: 'Not found event', status: 404 });
    }
    await PromotionEventService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await PromotionEventService.getAll(params);
    return resSuccess(res, { data: rows, extra: { total: count } });
  } catch (err) {
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await PromotionEventService.getById(id)
    if (!item) {
      return resError(res, { message: 'Not found event', status: 404 });
    }
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await PromotionEventService.getById(id)
    if (!item) {
      return resError(res, { message: 'Not found event', status: 404 });
    }
    await PromotionEventService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
