const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      name: Joi.string().max(255).required(),
      icon: Joi.string().max(255).allow('', null),
      priority: Joi.number().integer().min(0),
    })
  },
  update: {
    body: Joi.object({
      name: Joi.string().max(255),
      icon: Joi.string().max(255).allow('', null),
      priority: Joi.number().integer().min(0),
    })
  },
}
