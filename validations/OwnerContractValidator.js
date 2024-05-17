const { Joi: JoiValidation } = require('express-validation')
const DateExtension = require('@joi/date');
const Constants = require('../constants');

const Joi = JoiValidation.extend(DateExtension);

module.exports = {
  create: {
    body: Joi.object({
      contract_sign_date: Joi.date().format().allow(null, ''),
      contract_created_by: Joi.number().integer().min(0).allow(null),
      contract_duration_month: Joi.number().integer().min(0).allow(null),
      owner_id: Joi.number().integer().min(1).required(),
      branch_vehicle_id: Joi.number().integer().min(1).required(),
      rental_from_date: Joi.date().format().allow(null, ''),
      rental_to_date: Joi.date().format().allow(null, ''),
      reconciliation: Joi.string().allow(null, ""),
      rental_type: Joi.string().valid(Constants.RENTAL_TYPE_ALL, Constants.RENTAL_TYPE_MONTH, Constants.RENTAL_TYPE_DAY).required(),
      revenue_rate: Joi.number().min(0).allow(null),
      contract_paper: Joi.object().keys({
        [Constants.OWNER_CONTRACT]: Joi.string().allow(null, ''),
        [Constants.OWNER_DELIVERY_REPORT]: Joi.string().allow(null, ''),
      }).unknown(true),
      contract_images: Joi.array().items(Joi.string()).allow(null),
      owner_day_price: Joi.number().integer().min(0).allow(null),
      owner_month_price: Joi.number().integer().min(0).allow(null),
      owner_month_km_limit: Joi.number().integer().min(0).allow(null),
      owner_overkm_price: Joi.number().integer().min(0).allow(null),
      owner_pin_price: Joi.number().integer().min(0).allow(null),
      has_maintain: Joi.boolean().allow(null),
      has_insurance: Joi.boolean().allow(null),
      current_km: Joi.number().integer().min(0).allow(null),
      contract_note: Joi.string().allow(null, ''),
    }),
  },
  update: {
    body: Joi.object({
      contract_sign_date: Joi.date().format().allow(null, ''),
      contract_created_by: Joi.number().integer().min(0).allow(null),
      contract_duration_month: Joi.number().integer().min(0).allow(null),
      owner_id: Joi.number().integer().min(1),
      branch_vehicle_id: Joi.number().integer().min(1),
      rental_from_date: Joi.date().format().allow(null, ''),
      rental_to_date: Joi.date().format().allow(null, ''),
      reconciliation: Joi.string().allow(null, ""),
      rental_type: Joi.string().valid(Constants.RENTAL_TYPE_ALL, Constants.RENTAL_TYPE_MONTH, Constants.RENTAL_TYPE_DAY),
      revenue_rate: Joi.number().min(0).allow(null),
      contract_paper: Joi.object().keys({
        [Constants.OWNER_CONTRACT]: Joi.string().allow(null, ''),
        [Constants.OWNER_DELIVERY_REPORT]: Joi.string().allow(null, ''),
      }).unknown(true),
      contract_images: Joi.array().items(Joi.string()).allow(null),
      owner_day_price: Joi.number().integer().min(0).allow(null),
      owner_month_price: Joi.number().integer().min(0).allow(null),
      owner_month_km_limit: Joi.number().integer().min(0).allow(null),
      owner_pin_price: Joi.number().integer().min(0).allow(null),
      has_maintain: Joi.boolean().allow(null),
      has_insurance: Joi.boolean().allow(null),
      current_km: Joi.number().integer().min(0).allow(null),
      owner_overkm_price: Joi.number().integer().min(0).allow(null),
      contract_note: Joi.string().allow(null, ''),
    })
  }
}
