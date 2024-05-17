'use strict'

const Op = require('sequelize').Op

const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')
const BranchVehicleService = require('../services/BranchVehicleService')
const UserService = require('../services/UserService')
const MediaService = require('../services/MediaService')
const { customDatetimeFormat } = require('../utils/DateUtil')
const db = require('../models')
const { OWNER_CONTRACT } = require('../constants')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    // Check owner avaiable
    if (data.owner_id > 0) {
      const owner = await UserService.getById(data.owner_id);
      if (!owner /** || (owner && owner.user_type != db.user.TYPE_OWNER) */) {
        return resError(res, { message: 'Chủ xe không tồn tại' })
      }
    }
    // Check branch-vehicle in store avaiable
    const branchVehicle = await BranchVehicleService.getById(data.branch_vehicle_id);
    if (!branchVehicle) {
      return resError(res, { message: 'Xe không tồn tại' })
    }
    if (branchVehicle.owner_id) {
      return resError(res, { message: 'Xe đã có hợp đồng' })
    }

    await BranchVehicleService.updateById(branchVehicle.id, data, branchVehicle.toJSON());

    return resSuccess(res, { data: branchVehicle });
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const
      { body, params } = req,
      { id } = params;

    const item = await BranchVehicleService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin hợp đồng' });
    }
    // Check owner avaiable
    if (body.owner_id > 0 && body.owner_id != item.owner_id) {
      const owner = await UserService.getById(body.owner_id);
      if (!owner /**|| (owner && owner.user_type != db.user.TYPE_OWNER)*/) {
        return resError(res, { message: 'Chủ xe không tồn tại' })
      }
    }
    if (body.branch_vehicle_id && body.branch_vehicle_id != item.id) {
      const branchVehicle = await BranchVehicleService.getById(body.branch_vehicle_id);
      if (!branchVehicle) {
        return resError(res, { message: 'Xe không tồn tại, branch_vehicle_id không hợp lệ' })
      }
      if (branchVehicle.owner_id) {
        return resError(res, { message: 'Xe đã có hợp đồng' })
      }
      body.owner_id = item.owner_id;
      await BranchVehicleService.changeOwner(item.id, body.branch_vehicle_id, body);
    }
    else {
      await BranchVehicleService.updateById(id, body, item.toJSON());
    }
    return resSuccess(res);
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const
      params = req.query,
      queryUser = {};

    if (params.vehicle_name) {
      params.name = params.vehicle_name;
    }
    delete params.vehicle_name

    if (params.owner_name) {
      queryUser.username = {
        [Op.like]: `%${params.owner_name}%`
      }
    }
    delete params.owner_name;

    const { rows, count } = await BranchVehicleService.getAll({
      ...params,
      owner_id: {
        [Op.ne]: null
      }
    }, {
      attributes: [
        'id',
        ['name', 'vehicle_name'],
        'owner_id',
        'rental_type',
        'owner_day_price',
        'owner_month_price',
        'owner_pin_price',
        'has_maintain',
        'has_insurance',
        'customer_overtime_price',
        'current_km',
        'owner_month_km_limit',
        'owner_overkm_price',
      ],
      include: [
        { model: db.branch, attributes: ['name'] },
        { model: db.user, where: queryUser, attributes: ['fullname', 'username'], required: true },
      ],
    });
    let data = []
    if (count) {
      data = await Promise.all(rows.map(async row => {
        console.log(row.user);
        const contract = {
          ...row.toJSON(),
          branch_id: row.branch ? row.branch.name : '',
          rental_type: BranchVehicleService.getRentalTypeLabel(row.rental_type),
          owner_name: row.user.fullname || row.user.username || '',
          contract_link: (
            await MediaService.getOne({
              target_table: db.branch_vehicle.tableName,
              target_id: row.id,
              target_type: 'owner_contract_paper',
              media_name: OWNER_CONTRACT,
            }, {
              attributes: ['path']
            })
            || {}).path
        }
        delete contract.branch;
        delete contract.user;
        return contract;
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
    const { id } = req.params
    const item = await BranchVehicleService.getOne({ id }, {
      attributes: [
        'id',
        ['id', 'branch_vehicle_id'],
        'contract_sign_date',
        'contract_expired_date',
        'contract_created_by',
        'owner_id',
        'branch_id',
        'rental_from_date',
        'rental_to_date',
        'reconciliation',
        'rental_type',
        'revenue_rate',
        'owner_day_price',
        'owner_month_price',
        'owner_month_km_limit',
        'owner_pin_price',
        'has_maintain',
        'has_insurance',
        'current_km',
        'owner_overkm_price',
        'other_data',
        'license_number',
        'vehicle_color',
      ],
    });
    if (!item) {
      return resError(res, { message: 'Không tìm thấy thông tin hợp đồng', status: 404 });
    }
    const data = _formatOutput(item.toJSON());

    data.contract_paper = {};
    const contractPapers = await MediaService.findAll(
      { target_table: db.branch_vehicle.tableName, target_id: data.id, target_type: "owner_contract_paper" },
      { attributes: ["media_name", "path"] }
    );
    contractPapers.forEach((img) => (data.contract_paper[img.media_name] = img.path));

    data.contract_images = (
      await MediaService.findAll(
        { target_table: db.branch_vehicle.tableName, target_id: data.id, target_type: "owner_contract_image" },
        { attributes: ["path"] }
      )
    ).map((row) => row.path);

    return resSuccess(res, { data });
  } catch (err) {
    console.log(err);
    return resError(res, { message: err.message });
  }
}

const _formatOutput = (data) => {
  const result = {}
  Object.entries(data).map(([key, val]) => {
    if (['rental_from_date',
      'rental_to_date',
      'insurance_expire_date',
      'registry_date',
      'contract_sign_date',
      'contract_expired_date'].includes(key)) {
      result[key] = val ? customDatetimeFormat(val, "YYYY-MM-DD HH:mm") : null;
    } else {
      result[key] = val;
    }
  })
  const { contract_note, contract_duration_month, } = data.other_data || {}
  result.contract_note = contract_note;
  result.contract_duration_month = contract_duration_month;
  delete result.other_data;

  return result;
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await BranchVehicleService.getById(id)
    if (!item || !item.owner_id) {
      return resError(res, { message: 'Không tìm thấy thông tin hợp đồng', status: 404 });
    }
    await BranchVehicleService.removeOwner(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}
