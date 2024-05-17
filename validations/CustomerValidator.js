const { Joi: JoiValidation } = require("express-validation");
const DateExtension = require("@joi/date");
const RegexUtil = require("../utils/RegexUtil");
const Joi = JoiValidation.extend(DateExtension);

module.exports = {
  create: {
    body: Joi.object({
      phone: Joi.string().regex(RegexUtil.phoneRegex).required(),
      fullname: Joi.string().min(3).max(100).required(),
      email: Joi.string().email().allow(null, ""),
      // password: Joi.string().min(6).max(30).required(),
      birthday: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      identity_number: Joi.string().allow(null, ""),
      identity_date: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      driver_licence: Joi.string().allow(null, ""),
      driver_licence_date: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      house_hold: Joi.string().allow(null, ""),
      house_hold_date: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      other_paper: Joi.string().allow(null, ""),
      other_paper_note: Joi.string().allow(null, ""),
      asset_deposit: Joi.string().max(30).allow(null, ""),
      asset_deposit_note: Joi.string().max(100).allow(null, ""),
      zalo: Joi.string().allow(null, ""),
      address: Joi.string().max(255).allow(null, ""),
      customer_note: Joi.string().max(255).allow(null, ""),
      // trust_scores: Joi.array().items(Joi.number().integer().min(0)).allow(null),
      branch_id: Joi.number().integer().min(0).allow(null),
      customer_image_identity_front: Joi.string().allow(null, ""),
      customer_image_identity_back: Joi.string().allow(null, ""),
      customer_image_driver_licence_front: Joi.string().allow(null, ""),
      customer_image_driver_licence_back: Joi.string().allow(null, ""),
      customer_image_house_hold: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      customer_image_other_paper: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      customer_image_asset_deposit: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      // customer_image: Joi.object()
      //   .keys({
      //     [constants.CUSTOMER_IMAGE_IDENTITY_FRONT]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_IDENTITY_BACK]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_HOUSE_HOLD]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_OTHER_PAPER]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_ASSET_DEPOSIT]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //   })
      //   .unknown(true),
      verify_identity: Joi.number().integer().min(0).allow(null),
      verify_driver_licence: Joi.number().integer().min(0).allow(null),
      verify_house_hold: Joi.number().integer().min(0).allow(null),
      verify_other_paper: Joi.number().integer().min(0).allow(null),
      verify_asset_deposit: Joi.number().integer().min(0).allow(null),
    }),
  },
  update: {
    body: Joi.object({
      phone: Joi.string().regex(RegexUtil.phoneRegex),
      fullname: Joi.string().min(3).max(100),
      email: Joi.string().email().allow(null, ""),
      // password: Joi.string().min(6).max(30),
      birthday: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      identity_number: Joi.string().allow(null, ""),
      identity_date: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      driver_licence: Joi.string().allow(null, ""),
      driver_licence_date: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      house_hold: Joi.string().allow(null, ""),
      house_hold_date: Joi.date().format("YYYY-MM-DD").allow(null, ""),
      other_paper: Joi.string().allow(null, ""),
      other_paper_note: Joi.string().allow(null, ""),
      asset_deposit: Joi.string().max(30).allow(null, ""),
      asset_deposit_note: Joi.string().max(100).allow(null, ""),
      zalo: Joi.string().allow(null, ""),
      address: Joi.string().max(255).allow(null, ""),
      customer_note: Joi.string().max(255).allow(null, ""),
      // trust_scores: Joi.array().items(Joi.number().integer().min(0)).allow(null),
      branch_id: Joi.number().integer().min(0).allow(null),
      customer_image_identity_front: Joi.string().allow(null, ""),
      customer_image_identity_back: Joi.string().allow(null, ""),
      customer_image_driver_licence_front: Joi.string().allow(null, ""),
      customer_image_driver_licence_back: Joi.string().allow(null, ""),
      customer_image_house_hold: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      customer_image_other_paper: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      customer_image_asset_deposit: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      // customer_image: Joi.object()
      //   .keys({
      //     [constants.CUSTOMER_IMAGE_IDENTITY_FRONT]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_IDENTITY_BACK]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_HOUSE_HOLD]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_OTHER_PAPER]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //     [constants.CUSTOMER_IMAGE_ASSET_DEPOSIT]: Joi.array().items(Joi.string().allow(null, "")).allow(null),
      //   })
      //   .unknown(true),
      verify_identity: Joi.number().integer().min(0).allow(null),
      verify_driver_licence: Joi.number().integer().min(0).allow(null),
      verify_house_hold: Joi.number().integer().min(0).allow(null),
      verify_other_paper: Joi.number().integer().min(0).allow(null),
      verify_asset_deposit: Joi.number().integer().min(0).allow(null),
    }),
  },
  upsertCustomerTrustScores: {
    body: Joi.object({
      trust_scores: Joi.array().items(Joi.object({
        id: Joi.number().integer().min(1).required(),
        note: Joi.string().allow(null, ""),
      })).required(),
    })
  }
};
