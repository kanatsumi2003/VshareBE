'use strict'

const db = require('../models');
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil');
const { VEHICLE_TYPE_CAR } = require('../constants');

exports.getPrepareData = async function (req, res) {
  try {
    const { fields } = req.query
    const listFields = fields.split(',');
    const data = {};
    if (listFields.includes('province_id')) {
      data.province_id = await db.zone.findAll({ where: { level: 1 }, attributes: ['id', 'name', 'code'] })
    }
    if (listFields.includes('district_id')) {
      data.district_id = await db.zone.findAll({ where: { level: 2 }, attributes: ['id', 'name', 'code', 'parent_id'] })
    }
    if (listFields.includes('branch_id')) {
      data.branch_id = await db.branch.findAll({ attributes: { exclude: ['procedure', 'holiday_event_price', 'week_days_price', 'province_id', 'district_id', 'deleted_at', 'created_at', 'updated_at', 'active'] } })
    }
    if (listFields.includes('vehicle_id')) {
      data.vehicle_id = await db.vehicle.findAll()
    }
    if (listFields.includes('user_id') ||
      listFields.includes('give_user_id') ||
      listFields.includes('return_user_id') ||
      listFields.includes('saler_id') ||
      listFields.includes('approve_by') ||
      listFields.includes('contract_created_by')) {
      const users = await db.user.findAll({ attributes: ['id', 'fullname', 'phone', 'branch_id', 'username'] });
      if (listFields.includes('user_id'))
        data.user_id = users;
      if (listFields.includes('give_user_id'))
        data.give_user_id = users;
      if (listFields.includes('return_user_id'))
        data.return_user_id = users;
      if (listFields.includes('saler_id'))
        data.saler_id = users;
      if (listFields.includes('approve_by'))
        data.approve_by = users;
      if (listFields.includes('owner_id'))
        data.owner_id = users
      if (listFields.includes('contract_created_by'))
        data.contract_created_by = users
    }
    if (listFields.includes('branch_vehicle_id') ||
      listFields.includes('estimate_branch_vehicle_id') ||
      listFields.includes('actual_branch_vehicle_id') ||
      listFields.includes('owner_id')) {
      const branchVehicles = await db.branch_vehicle.findAll({
        attributes: ['id', 'name', 'customer_day_km_limit', 'customer_overkm_price', 'customer_overtime_price', 'license_number', 'vehicle_color', 'other_data'],
        where: { active: true },
        include: [
          { model: db.vehicle, attributes: ['name', 'fuel'] }
        ]
      })
      if (listFields.includes('branch_vehicle_id')) {
        data.branch_vehicle_id = branchVehicles
      }
      if (listFields.includes('estimate_branch_vehicle_id')) {
        data.estimate_branch_vehicle_id = branchVehicles
      }
      if (listFields.includes('actual_branch_vehicle_id')) {
        data.actual_branch_vehicle_id = branchVehicles
      }
    }
    if (listFields.includes('attributes')) {
      data.attributes = await db.attribute.findAll({ attributes: ['id', 'name', 'icon'] })
    }
    if (listFields.includes('brand_id')) {
      const brands = await db.vehicle_brand.findAll({ attributes: ['id', 'name', 'vehicle_type'] })
      data.brand_id = brands.map(b => ({ ...b.toJSON(), name: `${b.name} (${b.vehicle_type == VEHICLE_TYPE_CAR ? 'Auto' : 'Bike'})` }))
    }
    if (listFields.includes('model_id')) {
      data.model_id = await db.vehicle_model.findAll({ attributes: ['id', 'name', 'brand_id'] })
    }
    return resSuccess(res, { data });
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}