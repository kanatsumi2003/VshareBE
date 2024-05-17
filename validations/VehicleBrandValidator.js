const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      vehicle_type: Joi.string().allow('C', 'M').required(),
      name: Joi.string().required(),
      position: Joi.number(),
    })
  },
  update: {
    body: Joi.object({
      vehicle_type: Joi.string().allow('C', 'M'),
      name: Joi.string(),
      position: Joi.number(),
    })
  },
}
