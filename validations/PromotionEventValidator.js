const { Joi } = require('express-validation')

module.exports = {
  create: {
    body: Joi.object({
      branch_id: Joi.number().required(),
      name: Joi.string().max(255).required(),
      from_date: Joi.date().format('YYYY-MM-DD HH:mm').required(),
      to_date: Joi.date().format('YYYY-MM-DD HH:mm').required(),
      price: Joi.number().required(),
      active: Joi.boolean().required(),
    })
  },
  update: {
    body: Joi.object({
      branch_id: Joi.number(),
      name: Joi.string().max(255),
      from_date: Joi.date().format('YYYY-MM-DD HH:mm'),
      to_date: Joi.date().format('YYYY-MM-DD HH:mm'),
      price: Joi.number(),
      active: Joi.boolean(),
    })
  },
}
