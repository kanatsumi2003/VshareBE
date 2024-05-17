const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      branch_id: Joi.array().items(Joi.number().integer().min(0)).allow(null),
      username: Joi.string().regex(/^[a-z0-9-_.]+$/i).min(3).max(100).required(),
      fullname: Joi.string().min(3).max(100).required(),
      phone: Joi.string().regex(/^[0-9]{9,13}$/).allow(null, ''),
      email: Joi.string().email().allow(null, ''),
      password: Joi.string().min(6).max(30).required(),
      active: Joi.boolean(),
    })
  },
  update: {
    body: Joi.object({
      branch_id: Joi.array().items(Joi.number().integer().min(0)).allow(null),
      username: Joi.any(),
      fullname: Joi.string().min(3).max(100),
      phone: Joi.string().regex(/^[0-9]{9,13}$/).allow(null, ''),
      email: Joi.string().email().allow(null, ''),
      password: Joi.string().min(6).max(30).allow(null, ''),
      active: Joi.boolean(),
    })
  },
}
