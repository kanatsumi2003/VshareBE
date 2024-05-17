const { Joi } = require("express-validation");

module.exports = {
  create: {
    body: Joi.object({
      branch_id: Joi.array().items(Joi.number().integer().min(1)).required(),
      vehicle_class: Joi.string().required(),
      base_price: Joi.number().integer().min(1).required(),
      weekend_price: Joi.number().integer().min(1).required(),
      month_price: Joi.number().integer().min(1).required(),
      customer_day_price_rules: Joi.array().items(
        Joi.object().keys({
          day_count_from: Joi.number().integer().min(0).required(),
          day_count_to: Joi.number().integer().min(Joi.ref("day_count_from")).required(),
          price: Joi.number().integer().required(),
        })
      ),
    }),
  },
  update: {
    body: Joi.object({
      vehicle_class: Joi.string(),
      base_price: Joi.number().integer().min(1),
      weekend_price: Joi.number().integer().min(1),
      month_price: Joi.number().integer().min(1),
      customer_day_price_rules: Joi.array().items(
        Joi.object().keys({
          day_count_from: Joi.number().integer().min(0).required(),
          day_count_to: Joi.number().integer().min(Joi.ref("day_count_from")).required(),
          price: Joi.number().integer().required(),
        })
      ),
    }),
  },
};
