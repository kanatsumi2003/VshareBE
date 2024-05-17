'use strict'

const UserService = require('../services/UserService')
const { success: resSuccess, error: resError, error } = require('../utils/ResponseUtil')
const db = require('../models');

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await UserService.getOne({ username: data.username })
    if (checkExist) {
      return resError(res, { message: 'Tên đăng nhập đã được sử dụng', status: 409 })
    }
    const item = await UserService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await UserService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy tài khoản', status: 404 });
    }
    delete body.username;
    await UserService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const
      params = req.query,
      queryBranch = {}
    if (params.branch_id) {
      queryBranch.id = params.branch_id;
      delete params.branch_id;
    }

    const { rows, count } = await UserService.getAll(params, {
      attributes: { exclude: ['password', 'deleted_at'] },
    })
    let data = [];
    if (count) {
      data = await Promise.all(rows.map(async row => {
        const branches = await row.getBranches({ where: queryBranch, attributes: ['name'] });
        return {
          ...row.toJSON(),
          branch_id: branches.map(b => b.name).join(', ')
        }
      }));
    }
    return resSuccess(res, { data, extra: { total: count } });
  } catch (err) {
    console.error(error);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await UserService.getOne({ id }, {
      attributes: { exclude: ['password'] },
    })
    if (!item) {
      return resError(res, { message: 'Không tìm thấy tài khoản', status: 404 });
    }
    const data = item.toJSON();
    data.branch_id = (await item.getBranches({ attributes: ['id'] })).map(b => b.id);
    return resSuccess(res, { data });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await UserService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy tài khoản', status: 404 });
    }
    await UserService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}
