'use strict'

const Op = require('sequelize').Op
const BranchVehicleService = require('../services/BranchVehicleService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')
const CommonUtil = require('../utils/CommonUtil')
const BranchService = require('../services/BranchService')
const UserService = require('../services/UserService')
const db = require('../models')
const VehicleService = require('../services/VehicleService')
const AttributeService = require('../services/AttributeService')
const PriceRuleService = require('../services/CustomerDayPriceRuleService')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    data.license_number = data.license_number.replace(/\s/g, '').toUpperCase();
    const checkExist = await BranchVehicleService.getOne({ license_number: data.license_number })
    if (checkExist) {
      return resError(res, { message: 'Biển số xe đã được sử dụng', status: 409 })
    }
    // Check branch avaiable
    if (data.branch_id > 0) {
      const branch = await BranchService.getById(data.branch_id);
      if (!branch) {
        return resError(res, { message: 'Chi nhánh không tồn tại, branch_id không hợp lệ' })
      }
    }
    // Check owner avaiable
    if (data.owner_id > 0) {
      const owner = await UserService.getById(data.owner_id);
      if (!owner || (owner && owner.user_type != db.user.TYPE_OWNER)) {
        return resError(res, { message: 'Chủ xe không tồn tại, owner_id không hợp lệ' })
      }
    }
    // Check vehicle in store avaiable
    const vehicle = await VehicleService.getById(data.vehicle_id);
    if (!vehicle) {
      return resError(res, { message: 'Xe không tồn tại, vehicle_id không hợp lệ' })
    }
    // Check valid attributes
    const attributes = data.attributes || [];
    if (attributes.length) {
      await Promise.all(attributes.map(async attId => {
        const attribute = await AttributeService.getById(attId);
        if (!attribute) {
          throw new Error(`Thuộc tính xe không tồn tại: ${attId}`);
        }
      }))
    }
    // Check valid customer_day_price_rules
    if (!PriceRuleService.isValidCustomerDayPriceRules(data.customer_day_price_rules || [])) {
      throw new Error('Cấu hình giá bị trùng lặp hoặc sai thứ tự');
    }
    data.name = `${data.license_number} ${vehicle.name} ${data.vehicle_color || ''}`.trim();
    const item = await BranchVehicleService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await BranchVehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    if (body.license_number) {
      body.license_number = body.license_number.replace(/\s/g, '').toUpperCase();
      if (body.license_number != item.license_number) {
        const checkExist = await BranchVehicleService.getOne({
          license_number: body.license_number,
          id: {
            [Op.ne]: item.id
          }
        })
        if (checkExist) {
          return resError(res, { message: 'Biển số xe đã được sử dụng', status: 409 })
        }
        body.name = `${body.name || item.name}`.replace(item.license_number, body.license_number);
      }
    }
    // Check branch avaiable
    if (body.branch_id > 0 && body.branch_id != item.branch_id) {
      const branch = await BranchService.getById(body.branch_id);
      if (!branch) {
        return resError(res, { message: 'Chi nhánh không tồn tại' })
      }
    }
    // Check owner avaiable
    if (body.owner_id > 0 && body.owner_id != item.owner_id) {
      const owner = await UserService.getById(body.owner_id);
      if (!owner || (owner && owner.user_type != db.user.TYPE_OWNER)) {
        return resError(res, { message: 'Chủ xe không tồn tại, owner_id không hợp lệ' })
      }
    }
    if (body.vehicle_id && body.vehicle_id != item.vehicle_id) {
      // Check vehicle in store avaiable
      const vehicle = await VehicleService.getById(body.vehicle_id);
      if (!vehicle) {
        return resError(res, { message: 'Xe không tồn tại, vehicle_id không hợp lệ' })
      }
      const oldVehicle = await VehicleService.getById(item.vehicle_id);
      if (oldVehicle) {
        body.name = `${body.name || item.name}`.replace(oldVehicle.name, vehicle.name);
      }
    }
    if (body.vehicle_color && body.vehicle_color != item.vehicle_color) {
      body.name = `${body.name || item.name}`.replace(item.vehicle_color, body.vehicle_color);
    }
    // Check valid attributes
    const attributes = body.attributes || [];
    if (attributes.length) {
      await Promise.all(attributes.map(async attId => {
        const attribute = await AttributeService.getById(attId);
        if (!attribute) {
          throw new Error(`Thuộc tính xe không tồn tại: ${attId}`);
        }
      }))
    }
    // Check valid customer_day_price_rules
    if (!PriceRuleService.isValidCustomerDayPriceRules(body.customer_day_price_rules || [])) {
      throw new Error('Cấu hình giá bị trùng lặp hoặc sai thứ tự');
    }
    await BranchVehicleService.updateById(id, body, item.toJSON());
    return resSuccess(res);
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await BranchVehicleService.getAll(params);
    let data = []
    if (count) {
      data = rows.map(row => {
        const vehicle = {
          ...row.toJSON(),
          customer_base_price: row.customer_base_price,
          customer_weekend_price: row.customer_weekend_price,
          customer_month_price: row.customer_month_price,
          customer_month_km_limit: row.customer_month_km_limit,
          customer_overkm_price: row.customer_overkm_price,
          customer_overtime_price: row.customer_overtime_price,
          branch_name: row.branch ? row.branch.name : '',
          owner_name: row.user ? row.user.fullname : '',
        }
        delete vehicle.branch;
        delete vehicle.user;
        return vehicle;
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
    const item = await BranchVehicleService.getVehicleDetail(id);
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    return resSuccess(res, { data: item });
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await BranchVehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    await BranchVehicleService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getCustomerDayPriceRules = async (req, res) => {
  try {
    const { id } = req.params
    const item = await BranchVehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    const { rows, count } = await BranchVehicleService.getCustomerDayPriceRules(id);
    return resSuccess(res, { data: rows, extra: { total: count } });
  } catch (err) {
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getAvaiableVehicles = async (req, res) => {
  try {
    const query = req.query
    let data = await BranchVehicleService.getAvaiableVehicles(query)
    if (data.length) {
      data = await Promise.all(data.map(async row => {
        const
          otherData = CommonUtil.JSONParse(row.other_data || {}),
          vehicle = row.vehicle.toJSON(),
          { vehicle_brand, vehicle_model } = vehicle,
          result = {
            branch_vehicle_id: row.id,
            name: vehicle_brand.name + ' ' + vehicle_model.name,
            price: row.customer_base_price,
            ...vehicle,
            attributes: (await row.getAttributes({ attributes: ['name', 'icon'] }))
              .map(a => ({ name: a.name, icon: a.icon })),
            brand_id: vehicle_brand.id,
            manufacture_year: otherData.manufacture_year || 0,
          };

        delete result.vehicle_brand;
        delete result.vehicle_model;
        return result;
      }))
    }
    return resSuccess(res, { data });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}
