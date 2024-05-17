const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      name: Joi.string().required(),
      brand_id: Joi.number().required(),
    })
  },
  update: {
    body: Joi.object({
      name: Joi.string(),
      brand_id: Joi.number(),
    })
  },
}
