const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      name: Joi.string().max(100).required(),
      icon: Joi.string().max(255).allow(null, ''),
      description: Joi.string().max(255).allow(null, ''),
      active: Joi.boolean(),
    })
  },
  update: {
    body: Joi.object({
      name: Joi.string().max(100),
      icon: Joi.string().max(255).allow(null, ''),
      description: Joi.string().max(255).allow(null, ''),
      active: Joi.boolean(),
    })
  },
}
