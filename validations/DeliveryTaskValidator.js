const { Joi } = require('express-validation')

const Constants = require('../constants')

module.exports = {
  update: {
    body: Joi.object({
      user_id: Joi.number().integer().min(0).allow(null),
      task_status: Joi.string().valid(Constants.TASK_STATUS_PENDING, Constants.TASK_STATUS_DONE, Constants.TASK_STATUS_CANCELED).allow(null),
    }),
  },
  updateDelivery: {
    body: Joi.object({
      receive_note: Joi.string().allow(null, ''),
      return_note: Joi.string().allow(null, ''),
      give_user_id: Joi.number().integer().min(0),
      return_user_id: Joi.number().integer().min(0),
      receive_etc_balance: Joi.number().integer().min(0),
      return_etc_balance: Joi.number().integer().min(0),
      receive_km: Joi.number().integer().min(0),
      return_km: Joi.number().integer().min(0),
      receive_fuel: Joi.number().integer().min(0),
      return_fuel: Joi.number().integer().min(0),
      deposit: Joi.object().keys({
        [Constants.DEPOSIT_IDENTITY_PAPER]: Joi.string().allow(null, ''),
        [Constants.DEPOSIT_IDENTITY_PAPER_NOTE]: Joi.string().allow(null, ''),
        [`${Constants.DEPOSIT_IDENTITY_PAPER}_returned`]: Joi.boolean().allow(null),
        [Constants.DEPOSIT_MOTOR]: Joi.string().allow(null, ''),
        [`${Constants.DEPOSIT_MOTOR}_returned`]: Joi.boolean().allow(null),
        [Constants.DEPOSIT_MOTOR_REGISTRATION]: Joi.string().allow(null, ''),
        [`${Constants.DEPOSIT_MOTOR_REGISTRATION}_returned`]: Joi.boolean().allow(null),
        [Constants.DEPOSIT_CASH]: Joi.number().integer().min(0).allow(null),
        [`${Constants.DEPOSIT_CASH}_returned`]: Joi.boolean().allow(null),
        [Constants.DEPOSIT_OTHER]: Joi.string().allow(null, ''),
        [`${Constants.DEPOSIT_OTHER}_returned`]: Joi.boolean().allow(null),
      }).unknown(true),
      deposit_images: Joi.array().items(Joi.string()).allow(null),
      before_car_image: Joi.object().keys({
        [Constants.CAR_IMAGE_FRONT]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_BACK]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_RIGHT]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_LEFT]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_INTERIOR]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_FUEL]: Joi.string().allow(null, ''),
        [Constants.CAR_VIDEO]: Joi.string().allow(null, ''),
      }).unknown(true),
      after_car_image: Joi.object().keys({
        [Constants.CAR_IMAGE_FRONT]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_BACK]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_RIGHT]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_LEFT]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_INTERIOR]: Joi.string().allow(null, ''),
        [Constants.CAR_IMAGE_FUEL]: Joi.string().allow(null, ''),
        [Constants.CAR_VIDEO]: Joi.string().allow(null, ''),
      }).unknown(true),
      delivery_status: Joi.string().required(),
    }).unknown(true),
  }
}
