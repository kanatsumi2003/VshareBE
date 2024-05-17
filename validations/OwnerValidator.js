const { Joi: JoiValidation } = require('express-validation')
const DateExtension = require('@joi/date')
const RegexUtil = require('../utils/RegexUtil')
const constants = require('../constants')
const Joi = JoiValidation.extend(DateExtension)

module.exports = {
  create: {
    body: Joi.object({
      phone: Joi.string().regex(RegexUtil.phoneRegex).required(),
      fullname: Joi.string().min(3).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(30).required(),
      province_id: Joi.number().integer().min(0).allow(null),
      district_id: Joi.number().integer().min(0).allow(null),
      address: Joi.string().max(255).required(),
      bank_name: Joi.string().max(255).allow(null, ''),
      bank_branch_name: Joi.string().max(255).allow(null, ''),
      bank_fullname: Joi.string().max(255).allow(null, ''),
      bank_account: Joi.string().max(255).allow(null, ''),
      commission: Joi.number().integer().min(0),
      rental_time_from: Joi.string().regex(RegExp(RegexUtil.timeRegex)).allow('', null),
      rental_time_to: Joi.string().regex(RegExp(RegexUtil.timeRegex)).allow('', null),
      limit_km: Joi.number().integer().min(0),
      overkm_fee: Joi.number().integer().min(0),
      overtime_fee: Joi.number().integer().min(0),
      free_delivery_km: Joi.number().integer().min(0),
      delivery_fee: Joi.number().integer().min(0),
      procedure: Joi.object().keys({
        [constants.PROCEDURE_IDENTITY]: Joi.valid(constants.PROCEDURE_TYPE_HOLD, constants.PROCEDURE_TYPE_VERIFY).allow(null, '').required(),
        [constants.PROCEDURE_HOUSEHOLD]: Joi.valid(constants.PROCEDURE_TYPE_HOLD, constants.PROCEDURE_TYPE_VERIFY).allow(null, '').required(),
        [constants.PROCEDURE_DRIVER_LICENCE]: Joi.valid(constants.PROCEDURE_TYPE_HOLD, constants.PROCEDURE_TYPE_VERIFY).allow(null, '').required(),
        [constants.PROCEDURE_DEPOSIT]: Joi.valid(constants.PROCEDURE_TYPE_HOLD, constants.PROCEDURE_TYPE_VERIFY).allow(null, '').required(),
        [constants.PROCEDURE_LABOR_CONTRACT]: Joi.valid(constants.PROCEDURE_TYPE_HOLD, constants.PROCEDURE_TYPE_VERIFY).allow(null, '').required(),
        [constants.PROCEDURE_OTHER]: Joi.valid(constants.PROCEDURE_TYPE_HOLD, constants.PROCEDURE_TYPE_VERIFY).allow(null, '').required(),
        [constants.PROCEDURE_IDENTITY + '_note']: Joi.string().allow(null, ''),
        [constants.PROCEDURE_HOUSEHOLD + '_note']: Joi.string().allow(null, ''),
        [constants.PROCEDURE_DRIVER_LICENCE + '_note']: Joi.string().allow(null, ''),
        [constants.PROCEDURE_DEPOSIT + '_note']: Joi.string().allow(null, ''),
        [constants.PROCEDURE_LABOR_CONTRACT + '_note']: Joi.string().allow(null, ''),
        [constants.PROCEDURE_OTHER + '_note']: Joi.string().allow(null, ''),
      }).unknown(true).allow(null).required(),
      holiday_event_price: Joi.object().keys({
        [constants.HOLIDAY_EVENT_NATIONAL]: Joi.number().integer().allow(null).required(),
        [constants.HOLIDAY_EVENT_HUNGKING]: Joi.number().integer().allow(null).required(),
        [constants.HOLIDAY_EVENT_LIBERATION]: Joi.number().integer().allow(null).required(),
        [constants.HOLIDAY_EVENT_NEWYEAR]: Joi.number().integer().allow(null).required(),
        [constants.HOLIDAY_EVENT_LUNAR]: Joi.number().integer().allow(null).required(),
      }).unknown(true).allow(null).required(),
      status: Joi.number().integer().min(0).allow(null),
    })
  },
  update: {
    body: Joi.object({
      
    })
  },
}
