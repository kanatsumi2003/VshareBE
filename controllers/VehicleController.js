'use strict'

const Op = require('sequelize').Op
const VehicleService = require('../services/VehicleService')
const AttributeService = require('../services/AttributeService')
const VehicleBrandService = require('../services/VehicleBrandService')
const VehicleModelService = require('../services/VehicleModelService')
const VehiclePriceService = require('../services/VehiclePriceService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')
const { getVehicleClassName, getTransmissionName, getFuelName } = require('../helpers/SystemConfigHelper')
const db = require('../models')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const brand = await VehicleBrandService.getById(data.brand_id);
    if (!brand) {
      throw new Error('Hãng xe không tồn tại')
    }
    const model = await VehicleModelService.getById(data.model_id);
    if (!model) {
      throw new Error('Hiệu xe không tồn tại')
    }
    if (model.brand_id != brand.id) {
      throw new Error('Hiệu xe không thuộc hãng xe')
    }
    const checkExist = await VehicleService.getOne({
      vehicle_type: data.vehicle_type,
      brand_id: data.brand_id,
      model_id: data.model_id,
      version: data.version,
      transmission: data.transmission,
    })
    if (checkExist) {
      return resError(res, { message: 'Xe đã tồn tại', status: 409 })
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
    data.name = `${brand.name} ${model.name} ${data.version}`;
    const item = await VehicleService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req;
    const { id } = params;
    const item = await VehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    if (body.brand_id || body.model_id || body.version || body.transmission) {
      const checkExist = await VehicleService.getOne({
        vehicle_type: body.vehicle_type || item.vehicle_type,
        brand_id: body.brand_id || item.brand_id,
        model_id: body.model_id || item.model_id,
        version: body.version || item.version,
        transmission: body.transmission || item.transmission,
        id: { [Op.ne]: id }
      })
      if (checkExist) {
        return resError(res, { message: 'Thông tin xe đã được sử dụng', status: 409 })
      }
      let brand, vehicleModel
      if (body.brand_id && body.brand_id != item.brand_id) {
        brand = await VehicleBrandService.getById(body.brand_id);
        if (!brand) {
          throw new Error('Hãng xe không tồn tại')
        }
      }
      if (body.model_id && body.model_id != item.model_id) {
        vehicleModel = await VehicleModelService.getById(body.model_id);
        if (!vehicleModel) {
          throw new Error('Hiệu xe không tồn tại')
        }
        if (vehicleModel.brand_id != (body.brand_id || item.brand_id)) {
          throw new Error('Hiệu xe không thuộc hãng xe')
        }
      }
      // Update vehicle name
      if (brand || vehicleModel) {
        if (!brand) {
          brand = await VehicleBrandService.getById(body.brand_id || item.brand_id);
        }
        if (!vehicleModel) {
          vehicleModel = await VehicleModelService.getById(body.model_id || item.model_id);
        }
        body.name = `${brand.name} ${vehicleModel.name} ${body.version || item.version}`;
      }
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
    await VehicleService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query;
    const { rows, count } = await VehicleService.getAll(params);
    let data = []
    if (count) {
      data = rows.map(row => ({
        id: row.id,
        name: row.name,
        vehicle_type: getVehicleClassName(row.vehicle_type),
        vehicle_class: row.vehicle_class,
        version: row.version,
        seats: row.seats,
        transmission: getTransmissionName(row.transmission),
        fuel: getFuelName(row.fuel),
        fuel_consumption: row.fuel_consumption,
        style: row.style,
      }));
    }
    return resSuccess(res, { data, extra: { total: count } });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { data: [], extra: { total: 0 } });
  }
}

exports.getItem = async (req, res) => {
  try {
    const { id } = req.params, { include_price_template } = req.query;
    let item = await VehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    if (include_price_template == 'true' && item.vehicle_class) {
      let priceTemplate = await VehiclePriceService.getOne({ vehicle_class: item.vehicle_class }, {
        attributes: ['base_price', 'weekend_price', 'month_price'],
        include: [{ model: db.customer_day_price_rule, attributes: ['day_count_from', 'day_count_to', 'price'] }]
      })
      if (priceTemplate) {
        priceTemplate = priceTemplate.toJSON();
        Object.entries(priceTemplate).map(([key, val]) => item[key] = val);
      }
    }
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await VehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy xe cần xóa', status: 404 });
    }
    await VehicleService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getPriceTemplate = async (req, res) => {
  try {
    const { id } = req.params
    const item = await VehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin xe', status: 404 });
    }
    let data = null
    if (item.vehicle_class) {
      data = await VehiclePriceService.getOne({ vehicle_class: item.vehicle_class }, {
        attributes: ['base_price', 'weekend_price', 'month_price'],
        include: [{ model: db.customer_day_price_rule, attributes: ['day_count_from', 'day_count_to', 'price'] }]
      })
    }
    return resSuccess(res, { data });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}
