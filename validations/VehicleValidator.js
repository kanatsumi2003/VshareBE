const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      vehicle_type: Joi.string().allow('C', 'M').required(),
      brand_id: Joi.number().integer().min(1).required(),
      model_id: Joi.number().integer().min(1).required(),
      vehicle_class: Joi.string().allow(null, ''),
      seats: Joi.number().integer().min(2).max(60).required(),
      version: Joi.string().required(),
      transmission: Joi.string().required(),
      fuel: Joi.string().required(),
      fuel_consumption: Joi.string().allow(null, ''),
      style: Joi.string().allow(null, ''),
      image: Joi.string().allow(null, ''),
      attributes: Joi.array().items(Joi.number().integer().min(0)),
    })
  },
  update: {
    body: Joi.object({
      vehicle_type: Joi.string().allow('C', 'M'),
      brand_id: Joi.number().integer().min(1),
      model_id: Joi.number().integer().min(1),
      vehicle_class: Joi.string().allow(null, ''),
      seats: Joi.number().integer().min(2).max(60),
      version: Joi.string(),
      transmission: Joi.string(),
      fuel: Joi.string(),
      fuel_consumption: Joi.string().allow(null, ''),
      style: Joi.string().allow(null, ''),
      image: Joi.string().allow(null, ''),
      attributes: Joi.array().items(Joi.number().integer().min(0)),
    })
  },
}
