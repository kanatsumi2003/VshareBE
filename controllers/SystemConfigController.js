'use strict'

const Op = require('sequelize').Op
const SystemConfigService = require('../services/SystemConfigService')
const { success: resSuccess } = require('../utils/ResponseUtil')

exports.getPrepareData = async function (req, res) {
  try {
    const { fields } = req.query;
    if (!fields) {
      return resSuccess(res, { data: [] });
    }
    const data = {}, fieldArr = fields.split(',');
    if (fields.indexOf('procedure.') > -1) {
      fieldArr.push('procedure_type')
    }
    if (fieldArr.includes('style')) {
      fieldArr.push('car_style')
    }
    if (fieldArr.includes('estimate_deposit_asset') || fieldArr.includes('asset_deposit')) {
      fieldArr.push('deposit_asset')
    }
    if (fieldArr.includes('estimate_deposit_paper')) {
      fieldArr.push('deposit_paper')
    }
    if (fieldArr.indexOf('deposit.identity_paper') > -1 && !fieldArr.includes('deposit_paper')) {
      fieldArr.push('deposit_paper')
    }
    if (fieldArr.some(f => ['verify_identity', 'verify_driver_licence', 'verify_house_hold', 'verify_other_paper', 'verify_asset_deposit'].includes(f))) {
      fieldArr.push('verify_status')
    }
    if (fields.includes('operation_costs.code') || fields.includes('post_operation_costs.code')) {
      fieldArr.push('operation_costs')
    }
    if (fields.includes('payment_methods')) {
      fieldArr.push('payment_method')
    }
    if (fields.includes('estimate_add_ons.code')) {
      fieldArr.push('add_ons')
    }
    const rows = await SystemConfigService.getValueByCode(fieldArr);
    rows.forEach(row => {
      if (row.code === 'car_style') {
        data.style = row.value;
      } else if (row.code === 'deposit_asset') {
        data.estimate_deposit_asset = row.value;
        data.asset_deposit = row.value;
      } else if (row.code === 'deposit_paper') {
        data.estimate_deposit_paper = row.value;
        data['deposit.identity_paper'] = row.value;
      } else if (row.code === 'verify_status') {
        data['verify_identity'] = row.value;
        data['verify_driver_licence'] = row.value;
        data['verify_house_hold'] = row.value;
        data['verify_other_paper'] = row.value;
        data['verify_asset_deposit'] = row.value;
      } else if (row.code === 'operation_costs') {
        data['operation_costs.code'] = row.value;
        data['post_operation_costs.code'] = row.value;
      } else if (row.code === 'payment_method' && fields.includes('payment_methods')) {
        data.payment_methods = row.value;
      }  else if (row.code === 'add_ons') {
        data.add_ons = row.value;
        data['estimate_add_ons.code'] = row.value;
      } else {
        data[row.code] = row.value;
      }
    });
    if (data.procedure_type) {
      fieldArr.forEach(fieldKey => {
        if (fieldKey.indexOf('procedure.') > -1) {
          data[fieldKey] = data.procedure_type;
        }
      })
    }
    return resSuccess(res, { data });
  } catch (err) {
    return resSuccess(res, { data: [] });
  }
}