const { Joi: JoiValidation } = require('express-validation')
const DateExtension = require('@joi/date');
const Joi = JoiValidation.extend(DateExtension);
const constants = require('../constants');

module.exports = {
  create: {
    body:
      Joi.object({
        branch_id: Joi.number().integer().min(1).required(),
        owner_id: Joi.number().integer().min(1).allow(0, null),
        rental_type: Joi.string().valid(constants.RENTAL_TYPE_ALL, constants.RENTAL_TYPE_DAY, constants.RENTAL_TYPE_MONTH).allow(null, ''),
        owner_day_price: Joi.number().integer().min(0).allow(null),
        owner_month_price: Joi.number().integer().min(0).allow(null),
        owner_month_km_limit: Joi.number().integer().min(0).allow(null),
        owner_overkm_price: Joi.number().integer().min(0).allow(null),
        customer_overtime_price: Joi.number().integer().min(0).required(),
        customer_base_price: Joi.number().integer().min(0).required(),
        customer_weekend_price: Joi.number().integer().min(0).required(),
        customer_month_price: Joi.number().integer().min(0).allow(null),
        customer_month_km_limit: Joi.number().integer().min(0).allow(null),
        customer_day_km_limit: Joi.number().integer().min(0).required(),
        customer_overkm_price: Joi.number().integer().min(0).required(),
        position_company: Joi.string().max(255).allow(null, ''),
        position_username: Joi.string().max(100).allow(null, ''),
        position_password: Joi.string().max(100).allow(null, ''),
        has_maintain: Joi.boolean().required(),
        has_insurance: Joi.boolean().required(),
        insurance_brand: Joi.alternatives().conditional('has_insurance', {
          is: true,
          then: Joi.string().max(255).required(),
          otherwise: Joi.allow(null, '')
        }),
        insurance_phone: Joi.alternatives().conditional('has_insurance', {
          is: true,
          then: Joi.string().max(30).required(),
          otherwise: Joi.allow(null, '')
        }),
        insurance_expire_date: Joi.alternatives().conditional('has_insurance', {
          is: true,
          then: Joi.date().format('YYYY-MM-DD').required(),
          otherwise: Joi.allow(null, '')
        }),
        etc_username: Joi.string().max(255).allow(null, ''),
        etc_password: Joi.string().max(255).allow(null, ''),
        etc_balance: Joi.number().integer().allow(null),
        registry_date: Joi.date().format('YYYY-MM-DD').allow(null, ''),
        current_km: Joi.number().allow(null),
        license_number: Joi.string().max(30).required(),
        vehicle_id: Joi.number().integer().min(0).required(),
        vehicle_color: Joi.string().allow(null, ''),
        manufacture_year: Joi.number().integer().min(0).allow(null),
        customer_day_price_rules: Joi.array().items(Joi.object().keys({
          day_count_from: Joi.number().integer().min(0).required(),
          day_count_to: Joi.number().integer().min(Joi.ref('day_count_from')).required(),
          price: Joi.number().integer().required(),
        })),
        attributes: Joi.array().items(Joi.number().integer().min(0)),
        car_image: Joi.object().keys({
          [constants.CAR_IMAGE_FRONT]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_BACK]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_RIGHT]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_LEFT]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_INTERIOR]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_FUEL]: Joi.string().allow(null, ''),
        }).unknown(true),
        latest_car_image: Joi.object().keys({
          [constants.CAR_IMAGE_FRONT]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_BACK]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_RIGHT]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_LEFT]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_INTERIOR]: Joi.string().allow(null, ''),
          [constants.CAR_IMAGE_FUEL]: Joi.string().allow(null, ''),
        }).unknown(true),
        latest_km: Joi.number().integer().min(0).allow(null),
        latest_fuel: Joi.number().integer().min(0).allow(null),
        car_document_image: Joi.object().keys({
          [constants.CAR_DOCUMENT_REGISTRATION]: Joi.string().allow(null, ''),
          [constants.CAR_DOCUMENT_REGISTRATION_CERT]: Joi.string().allow(null, ''),
          [constants.CAR_DOCUMENT_LIABILITY_CERT]: Joi.string().allow(null, ''),
          [constants.CAR_DOCUMENT_PHYSICAL_CERT]: Joi.string().allow(null, ''),
          [constants.CAR_DOCUMENT_OTHER]: Joi.string().allow(null, ''),
        }).unknown(true),
        active: Joi.boolean(),
      })
  },
  update: {
    body: Joi.object({
      branch_id: Joi.number().integer().min(1),
      owner_id: Joi.number().integer().min(1).allow(0, null),
      rental_type: Joi.string().valid(constants.RENTAL_TYPE_ALL, constants.RENTAL_TYPE_DAY, constants.RENTAL_TYPE_MONTH).allow(null, ''),
      owner_day_price: Joi.number().integer().min(0).allow(null),
      owner_month_price: Joi.number().integer().min(0).allow(null),
      owner_month_km_limit: Joi.number().integer().min(0).allow(null),
      owner_overkm_price: Joi.number().integer().min(0).allow(null),
      customer_overtime_price: Joi.number().integer().min(0),
      customer_base_price: Joi.number().integer().min(0),
      customer_weekend_price: Joi.number().integer().min(0),
      customer_month_price: Joi.number().integer().min(0).allow(null),
      customer_month_km_limit: Joi.number().integer().min(0).allow(null),
      customer_day_km_limit: Joi.number().integer().min(0),
      customer_overkm_price: Joi.number().integer().min(0),
      position_company: Joi.string().max(255).allow(null, ''),
      position_username: Joi.string().max(100).allow(null, ''),
      position_password: Joi.string().max(100).allow(null, ''),
      has_maintain: Joi.boolean(),
      has_insurance: Joi.boolean(),
      insurance_brand: Joi.alternatives().conditional('has_insurance', {
        is: true,
        then: Joi.string().max(255),
        otherwise: Joi.allow(null, '')
      }),
      insurance_phone: Joi.alternatives().conditional('has_insurance', {
        is: true,
        then: Joi.string().max(30),
        otherwise: Joi.allow(null, '')
      }),
      insurance_expire_date: Joi.alternatives().conditional('has_insurance', {
        is: true,
        then: Joi.date().format('YYYY-MM-DD'),
        otherwise: Joi.allow(null, '')
      }),
      etc_username: Joi.string().max(255).allow(null, ''),
      etc_password: Joi.string().max(255).allow(null, ''),
      etc_balance: Joi.number().integer().allow(null),
      registry_date: Joi.date().format('YYYY-MM-DD').allow(null, ''),
      current_km: Joi.number().allow(null),
      license_number: Joi.string().max(20),
      vehicle_id: Joi.number().integer().min(0),
      vehicle_color: Joi.string().allow(null, ''),
      manufacture_year: Joi.number().integer().min(0).allow(null),
      customer_day_price_rules: Joi.array().items(Joi.object().keys({
        day_count_from: Joi.number().integer().min(0).required(),
        day_count_to: Joi.number().integer().min(Joi.ref('day_count_from')).required(),
        price: Joi.number().integer().required(),
      })),
      attributes: Joi.array().items(Joi.number().integer().min(0)),
      car_image: Joi.object().keys({
        [constants.CAR_IMAGE_FRONT]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_BACK]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_RIGHT]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_LEFT]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_INTERIOR]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_FUEL]: Joi.string().allow(null, ''),
      }).unknown(true),
      latest_car_image: Joi.object().keys({
        [constants.CAR_IMAGE_FRONT]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_BACK]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_RIGHT]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_LEFT]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_INTERIOR]: Joi.string().allow(null, ''),
        [constants.CAR_IMAGE_FUEL]: Joi.string().allow(null, ''),
      }).unknown(true),
      latest_km: Joi.number().integer().min(0).allow(null),
      latest_fuel: Joi.number().integer().min(0).max(100).allow(null),
      car_document_image: Joi.object().keys({
        [constants.CAR_DOCUMENT_REGISTRATION]: Joi.string().allow(null, ''),
        [constants.CAR_DOCUMENT_REGISTRATION_CERT]: Joi.string().allow(null, ''),
        [constants.CAR_DOCUMENT_LIABILITY_CERT]: Joi.string().allow(null, ''),
        [constants.CAR_DOCUMENT_PHYSICAL_CERT]: Joi.string().allow(null, ''),
        [constants.CAR_DOCUMENT_OTHER]: Joi.string().allow(null, ''),
      }).unknown(true),
      active: Joi.boolean(),
    })
  },
}
