const { Joi: JoiValidation } = require('express-validation')
const DateExtension = require('@joi/date');
const RegexUtil = require('../utils/RegexUtil');
const Joi = JoiValidation.extend(DateExtension);

module.exports = {
  previewBookingContract: {
    body: Joi.object({
      branch_id: Joi.number().integer().min(0).allow(null),
      customer_id: Joi.number().integer().min(0).allow(null),
      fullname: Joi.string().min(3).max(100),
      email: Joi.string().email().allow(null, ''),
      phone: Joi.string().regex(RegexUtil.phoneRegex),
      identity_number: Joi.string().regex(RegexUtil.identityRegex).allow(null, ''),
      identity_date: Joi.date().format().allow(null, ''),
      driver_licence_number: Joi.string().allow(null, ''),
      driver_licence_date: Joi.date().format().allow(null, ''),
      address: Joi.string().min(3).max(255).allow(null, ''),
      estimate_branch_vehicle_id: Joi.number().integer().min(0).allow(null),
      estimate_price: Joi.number().integer().min(0),
      estimate_receive_datetime: Joi.date().format().allow(null, ''),
      estimate_return_datetime: Joi.date().format().allow(null, ''),
      estimate_rental_duration: Joi.string().regex(/^((\d+y)?(\d+m)?(\d+d)|\d)$/).allow(0, ''),
      prepay: Joi.number().integer().min(0).allow(null),
    }),
  },
}
