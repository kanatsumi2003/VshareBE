'use strict'

const Op = require('sequelize').Op
const TrustScoreConfigService = require('../services/TrustScoreConfigService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await TrustScoreConfigService.getOne({
      name: data.name
    })
    if (checkExist) {
      return resError(res, { message: 'Tên tiêu chí đã được sử dụng', status: 409 })
    }
    const result = await TrustScoreConfigService.create(data);
    return resSuccess(res, { data: result });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await TrustScoreConfigService.getOne({ id, parent_id: null })
    if (!item) {
      return resError(res, { message: 'Không tồn tại tiêu chí', status: 404 });
    }
    if (body.name && body.name !== item.name) {
      const checkExist = await TrustScoreConfigService.getOne({
        name: body.name,
        id: { [Op.ne]: id },
      });
      if (checkExist) {
        return resError(res, { message: "Tên tiêu chí đã được sử dụng", status: 409 });
      }
    }
    await TrustScoreConfigService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await TrustScoreConfigService.getAll({ ...params, parent_id: null });
    let data = []
    if (count) {
      data = await Promise.all(rows.map(async row => {
        const trust_scores = await row.getTrust_scores();
        const item = {
          id: row.id,
          name: row.name,
          trust_scores: trust_scores.map(ts => `${ts.name} (${ts.point})`).join('\n'),
          note: row.note,
        };
        return item;
      }))
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
    const item = await TrustScoreConfigService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tồn tại tiêu chí', status: 404 });
    }
    const data = item.toJSON();
    data.trust_scores = await item.getTrust_scores({ attributes: ['id', 'name', 'point'] });
    return resSuccess(res, { data });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await TrustScoreConfigService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tồn tại tiêu chí', status: 404 });
    }
    await TrustScoreConfigService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
