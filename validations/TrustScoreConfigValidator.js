const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      name: Joi.string().max(255).required(),
      trust_scores: Joi.array().items(Joi.object({
        name: Joi.string().max(255).required(),
        point: Joi.number().min(0).max(100).required(),
      })).allow(null),
      note: Joi.string().allow(null, ''),
    })
  },
  update: {
    body: Joi.object({
      name: Joi.string().max(255),
      trust_scores: Joi.array().items(Joi.object({
        name: Joi.string().max(255).required(),
        point: Joi.number().min(0).max(100).required(),
      })).allow(null),
      note: Joi.string().allow(null, ''),
    })
  },
}
