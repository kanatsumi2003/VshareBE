const { Joi: JoiValidation } = require('express-validation')
const DateExtension = require('@joi/date');
const Joi = JoiValidation.extend(DateExtension);
const RegexUtil = require('../utils/RegexUtil');
const Constants = require('../constants');

module.exports = {
  getAvaiableVehicles: {
    query: Joi.object({
      branch_id: Joi.number().integer().min(0).required(),
      from_date: Joi.date().format('HH:mm DD-MM-YYYY').allow(null, ''),
      to_date: Joi.date().format('HH:mm DD-MM-YYYY').allow(null, ''),
      vehicle_type: Joi.string().required(),
      brand_id: Joi.number().integer().allow(null, ''),
      transmission: Joi.string().valid('A', 'M').allow(null, ''),
      price_from: Joi.number().integer().min(0).allow(null, ''),
      price_to: Joi.number().integer().min(0).allow(null, ''),
    })
  },
  createBooking: {
    body: Joi.object({
      vehicle_type: Joi.string().valid(Constants.VEHICLE_TYPE_CAR, Constants.VEHICLE_TYPE_MOTOR).required(),
      branch_id: Joi.number().integer().min(0).required(),
      customer_id: Joi.number().integer().min(0).allow(null),
      fullname: Joi.string().min(3).max(100).required(),
      phone: Joi.string().regex(RegexUtil.phoneRegex).required(),
      email: Joi.string().email().allow(null, ''),
      address: Joi.string().max(255).allow(null, ''),
      receive_note: Joi.string().max(255).allow(null, ''),
      estimate_branch_vehicle_id: Joi.number().integer().min(0).required(),
      estimate_receive_datetime: Joi.date().format().required(),
      estimate_return_datetime: Joi.date().format().required(),
      estimate_rental_duration: Joi.string().regex(RegexUtil.durationRegex).required(),
      receive_type: Joi.string().valid(Constants.RECEIVE_TYPE_GARA, Constants.RECEIVE_TYPE_HOME, Constants.RECEIVE_TYPE_ADDRESS).required(),
      estimate_price: Joi.number().integer().min(0).required(),
      receive_address: Joi.string().max(255).allow(null, ''),
      payment_method: Joi.string().required(),
      add_ons: Joi.array().items(Joi.object({
        code: Joi.string().required(),
        cost: Joi.number().integer().required(),
        unit: Joi.string().allow(null, ''),
        note: Joi.string().allow(null, ''),
      })).allow(null),
      customer_request_note: Joi.string().max(1000).allow(null, ''),
      discount_code: Joi.string().allow(null, ''),
      source: Joi.string().valid('app'),
    }),
  },
  updateProfile: {
    body: Joi.object({
      fullname: Joi.string().min(3).max(100).allow(null, ''),
      email: Joi.string().email().allow(null, ''),
      address: Joi.string().max(255).allow(null, ''),
      birthday: Joi.date().format().allow(null, ''),
      identity_number: Joi.string().regex(RegexUtil.identityRegex).allow(null, ''),
      customer_image: Joi.object().keys({
        [Constants.CUSTOMER_IMAGE_IDENTITY_FRONT]: Joi.string().allow(null, ''),
        [Constants.CUSTOMER_IMAGE_IDENTITY_BACK]: Joi.string().allow(null, ''),
        [Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT]: Joi.string().allow(null, ''),
        [Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK]: Joi.string().allow(null, ''),
        [Constants.CUSTOMER_IMAGE_HOUSE_HOLD]: Joi.string().allow(null, ''),
      }).unknown(true),
      customer_other_document_files: Joi.array().items(Joi.string()).allow(null),
    }),
  },
  register: {
    body: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().regex(RegexUtil.phoneRegex).required(),
      password: Joi.string().min(6).max(100).required(),
    }),
  },
  login: {
    body: Joi.object({
      phone: Joi.string().regex(RegexUtil.phoneRegex).required(),
      password: Joi.string().min(6).max(100).required(),
    }),
  },
  forgotPassword: {
    body: Joi.object({
      phone: Joi.string().regex(RegexUtil.phoneRegex).required(),
      email: Joi.string().email().required(),
    }),
  },
  changePassword: {
    body: Joi.object({
      oldPassword: Joi.string().min(6).max(100).required(),
      newPassword: Joi.string().min(6).max(100).required(),
      confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required(),
    }),
  },
}
