'use strict'

const Op = require('sequelize').Op
const BranchService = require('../services/BranchService')
const SystemConfigService = require('../services/SystemConfigService')
const ZoneService = require('../services/ZoneService')
const { success: resSuccess, error: resError } = require('../utils/ResponseUtil')

exports.createItem = async (req, res) => {
  try {
    const data = req.body;
    const checkExist = await BranchService.getOne({ code: data.code.toUpperCase() })
    if (checkExist) {
      return resError(res, { message: 'Mã chi nhánh đã được sử dụng', status: 409 })
    }
    const province = await ZoneService.getById(data.province_id);
    if (!province || province.level != 1) {
      throw new Error('Tỉnh thành không tồn tại. ID tỉnh thành không hợp lệ');
    }
    const district = await ZoneService.getById(data.district_id);
    if (!district || district.level != 2) {
      throw new Error('Quận huyện không tồn tại. ID quận huyện không hợp lệ');
    }
    if (district.parent_id != province.id) {
      throw new Error('Quận huyện không thuộc tỉnh thành');
    }
    data.full_address = [data.address, district.name, province.name].join(', ');
    const item = await BranchService.create(data);
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}

exports.updateItem = async (req, res) => {
  try {
    const { body, params } = req, { id } = params;
    const item = await BranchService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy chi nhánh', status: 404 });
    }
    if (body.code && body.code != item.code) {
      const checkExist = await BranchService.getOne({
        code: body.code.toUpperCase(),
        id: { [Op.ne]: id }
      })
      if (checkExist) {
        return resError(res, { message: 'Tên chi nhánh đã được sử dụng', status: 409 })
      }
    }
    let provinceTmp;
    if (body.province_id && body.province_id != item.province_id) {
      const province = await ZoneService.getById(body.province_id);
      if (!province || province.level != 1) {
        throw new Error('Tỉnh thành không tồn tại. ID tỉnh thành không hợp lệ');
      }
      provinceTmp = province;
    }
    let districtTmp;
    if (body.district_id && body.district_id != item.district_id) {
      districtTmp = await ZoneService.getById(body.district_id);
      if (!districtTmp || districtTmp.level != 2) {
        throw new Error('Quận huyện không tồn tại. ID quận huyện không hợp lệ');
      }
      if (districtTmp.parent_id != (provinceTmp ? provinceTmp.id : item.province_id)) {
        throw new Error('Quận huyện không thuộc tỉnh thành');
      }
    }
    if (body.address || provinceTmp || districtTmp) {
      if (!provinceTmp) {
        provinceTmp = await ZoneService.getById(item.province_id);
      }
      if (!districtTmp) {
        districtTmp = await ZoneService.getById(item.district_id);
      }
      body.full_address = [body.address || item.address, districtTmp.name, provinceTmp.name].join(', ');
    }
    await BranchService.updateById(id, body);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getItems = async (req, res) => {
  try {
    const params = req.query,
      { include_addons } = params;
    delete params.include_addons;

    const { rows, count } = await BranchService.getAll(params);
    let data = [], addOns = [];
    if (count) {

      if (include_addons == 1) {
        const systemConfigAddOn = await SystemConfigService.getValueByCode('add_ons');
        if (systemConfigAddOn) {
          addOns = systemConfigAddOn.value;
        }
      }

      data = rows.map(row => {
        const branch = {
          ...row.toJSON(),
          province_name: row.province ? row.province.name : '',
          district_name: row.district ? row.district.name : '',
          rental_time: `${row.rental_time_from || ''} - ${row.rental_time_to}`,
          active: row.active ? 'Hoạt động' : 'Đã khóa',
          ...row.other_data,
        }
        // Get add-on name
        if (include_addons == 1) {
          branch.add_ons = (branch.add_ons || []).map(addon => {
            const selected = addOns.find(a => a.code == addon.code)
            return { ...addon, name: selected ? selected.name : '' }
          })
        }
        delete branch.province
        delete branch.district
        delete branch.rental_time_from
        delete branch.rental_time_to
        delete branch.other_data
        return branch;
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
    let item = await BranchService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy chi nhánh', status: 404 });
    }
    return resSuccess(res, { data: item });
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params
    const item = await BranchService.getById(id)
    if (!item) {
      return resError(res, { message: 'Không tìm thấy chi nhánh', status: 404 });
    }
    await BranchService.deleteById(id);
    return resSuccess(res);
  } catch (err) {
    return resError(res, { message: err.message });
  }
}

exports.getPaymentMethods = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const data = [];
    let allows = [];

    if (branch_id) {
      const branch = await BranchService.getById(branch_id);
      allows = branch.payment_methods || [];
    }

    if (allows.length) {
      const item = await SystemConfigService.getValueByCode('payment_method');
      for (const paymentMethod of item.value) {
        if (paymentMethod.parent === null) {
          paymentMethod.sub = [];
          data.push(paymentMethod);
        } else {
          const parentIndex = data.findIndex(r => r.code == paymentMethod.parent);
          if (parentIndex > -1) {
            data[parentIndex].sub.push(paymentMethod);
          }
        }
      }
    }
    return resSuccess(res, { data });
  } catch (err) {
    console.error(err);
    return resSuccess(res, { message: err.message, data: [] });
  }
}
