const { Joi } = require('express-validation')

module.exports = {
  createProvince: {
    body: Joi.object({
      name: Joi.string().required(),
      position: Joi.number(),
    })
  },
  updateProvince: {
    body: Joi.object({
      name: Joi.string(),
      position: Joi.number(),
    })
  },
  createDistrict: {
    body: Joi.object({
      name: Joi.string().required(),
      province_id: Joi.number().required(),
      position: Joi.number(),
    })
  },
  updateDistrict: {
    body: Joi.object({
      name: Joi.string(),
      province_id: Joi.number(),
      position: Joi.number(),
    })
  },
}
