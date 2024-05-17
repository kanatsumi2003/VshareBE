/* eslint-disable indent */
"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { sendEmail } = require("../libs/mail/awsEmailService");
const { formatPhone0x } = require("../utils/FormatUtil");
const { randomString } = require("../utils/StringUtil");
const { buildQuery } = require("../helpers/QueryHelper");
const Constants = require("../constants");
const db = require("../models");
const AbstractBaseService = require("./AbstractBaseService");
const MediaService = require("./MediaService");

function filterCustomerAtrributes(data) {
  const customer = {};
  Object.keys(db.customer.rawAttributes).forEach((fieldKey) => {
    if (typeof data[fieldKey] != "undefined") {
      switch (fieldKey) {
        case "birthday":
        case "identity_date":
        case "driver_licence_date":
        case "approve_by":
          customer[fieldKey] = data[fieldKey] || null;
          break;
        case "trust_score":
          customer[fieldKey] = data[fieldKey] || 0;
          break;
        case "approve_status":
          customer[fieldKey] = data[fieldKey] || Constants.APPROVE_STATUS_PENDING;
          break;

        default:
          customer[fieldKey] = data[fieldKey];
          break;
      }
    }
  });
  return customer;
}

function filterOtherDataFields(data) {
  const otherFields = {};
  const keys = [
    "house_hold",
    "house_hold_date",
    "other_paper",
    "other_paper_note",
    "asset_deposit",
    "asset_deposit_note",
    "verify_identity",
    "verify_driver_licence",
    "verify_house_hold",
    "verify_other_paper",
    "verify_asset_deposit",
  ];
  keys.forEach((key) => {
    if (typeof data[key] != "undefined") otherFields[key] = data[key];
  });
  return otherFields;
}

function convertOutputFileFields(data) {
  data.customer_image_identity_front = ''
  data.customer_image_identity_back = ''
  data.customer_image_driver_licence_front = ''
  data.customer_image_driver_licence_back = ''
  data.customer_image_house_hold = []
  data.customer_image_other_paper = []
  data.customer_image_asset_deposit = []
  if (data.customer_image) {
    const customerImage = data.customer_image;
    if (customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_FRONT] && customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_FRONT].length) {
      data.customer_image_identity_front = customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_FRONT][0];
    }
    if (customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_BACK] && customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_BACK].length) {
      data.customer_image_identity_back = customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_BACK][0];
    }
    if (customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT] && customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT].length) {
      data.customer_image_driver_licence_front = customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT][0];
    }
    if (customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK] && customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK].length) {
      data.customer_image_driver_licence_back = customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK][0];
    }
    if (customerImage[Constants.CUSTOMER_IMAGE_HOUSE_HOLD]) {
      data.customer_image_house_hold = customerImage[Constants.CUSTOMER_IMAGE_HOUSE_HOLD].filter(Boolean);
    }
    if (customerImage[Constants.CUSTOMER_IMAGE_OTHER_PAPER]) {
      data.customer_image_other_paper = customerImage[Constants.CUSTOMER_IMAGE_OTHER_PAPER].filter(Boolean);
    }
    if (customerImage[Constants.CUSTOMER_IMAGE_ASSET_DEPOSIT]) {
      data.customer_image_asset_deposit = customerImage[Constants.CUSTOMER_IMAGE_ASSET_DEPOSIT].filter(Boolean);
    }
    delete data.customer_image;
  }
  return data;
}

function convertInputFileFields(data) {
  if (data.customer_image) {
    const customerImage = data.customer_image || {}
    const customer_image = {
      [Constants.CUSTOMER_IMAGE_IDENTITY_FRONT]: data.customer_image_identity_front || customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_FRONT] || '',
      [Constants.CUSTOMER_IMAGE_IDENTITY_BACK]: data.customer_image_identity_back || customerImage[Constants.CUSTOMER_IMAGE_IDENTITY_BACK] || '',
      [Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT]: data.customer_image_driver_licence_front || customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_FRONT] || '',
      [Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK]: data.customer_image_driver_licence_back || customerImage[Constants.CUSTOMER_IMAGE_DRIVER_LICENCE_BACK] || '',
      [Constants.CUSTOMER_IMAGE_HOUSE_HOLD]: data.customer_image_house_hold || customerImage[Constants.CUSTOMER_IMAGE_HOUSE_HOLD] || [],
      [Constants.CUSTOMER_IMAGE_OTHER_PAPER]: data.customer_image_other_paper || customerImage[Constants.CUSTOMER_IMAGE_OTHER_PAPER] || [],
      [Constants.CUSTOMER_IMAGE_ASSET_DEPOSIT]: data.customer_image_asset_deposit || customerImage[Constants.CUSTOMER_IMAGE_ASSET_DEPOSIT] || [],
    }
    data.customer_image = customer_image;
  }
  return data;
}

class CustomerService extends AbstractBaseService {
  constructor() {
    super(db.customer);
  }

  getAll = (params, options) => {
    const query = buildQuery(params);
    if (params.phone) {
      delete query.where.phone;
      query.where.phone0x = {
        [Op.like]: `%${formatPhone0x(params.phone)}%`,
      };
    }
    if (params.number_success_booking > 1) {
      query.where.number_success_booking = {
        [Op.gt]: 1,
      };
    }
    return this.model.findAndCountAll({ ...query, ...options });
  };

  create = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      data.other_data = filterOtherDataFields(data);
      const customer = await this.model.create(filterCustomerAtrributes(data), { transaction: t });
      if (Array.isArray(data.trust_score_configs)) {
        await Promise.all(
          data.trust_score_configs.map(async (trustScoreConfig) => {
            await db.customer_trust_score.create(
              {
                customer_id: customer.id,
                trust_score_config_id: trustScoreConfig.id,
              },
              { transaction: t }
            );
          })
        );
        customer.trust_score = data.trust_score_configs.reduce((a, b) => a + b.point, 0);
        customer.trusted_at = new Date();
        customer.save({ transaction: t });
      }

      // Save images
      convertInputFileFields(data);
      if (data.customer_image) {
        await MediaService.saveMedia(customer.id, data.customer_image, "customer_image", this.tableName, {
          transaction: t,
        });
      }

      await t.commit();
      return customer;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  updateById = async (id, data, oldCustomer = {}) => {
    const t = await db.sequelize.transaction();
    try {
      data.other_data = { ...oldCustomer.other_data, ...filterOtherDataFields(data) };
      if (Array.isArray(data.trust_score_configs)) {
        await db.customer_trust_score.destroy({ where: { customer_id: id }, transaction: t });
        await Promise.all(
          data.trust_score_configs.map(async (trustScoreConfig) => {
            await db.customer_trust_score.create(
              {
                customer_id: id,
                trust_score_config_id: trustScoreConfig.id,
              },
              { transaction: t }
            );
          })
        );
        data.trust_score = data.trust_score_configs.reduce((a, b) => a + b.point, 0);
        data.trusted_at = new Date();
      }
      // Save images
      convertInputFileFields(data);
      if (data.customer_image) {
        await MediaService.saveMedia(id, data.customer_image, "customer_image", this.tableName, {
          transaction: t,
        });
      }
      const verifyStatusArr = Object.entries(data).filter(([k]) => k.startsWith("verify_"));
      if (
        verifyStatusArr.length &&
        { ...oldCustomer, ...data }.profile_status != Constants.CUSTOMER_PROFILE_STATUS_BLACKLIST
      ) {
        const unVerified = verifyStatusArr.some(([_, v]) => v != Constants.CUSTOMER_VERIFY_STATUS_VERIFIED);
        data.profile_status = unVerified
          ? Constants.CUSTOMER_PROFILE_STATUS_UNCOMPLETED
          : Constants.CUSTOMER_PROFILE_STATUS_COMPLETED;
      }
      await this.model.update(data, { where: { id }, transaction: t });
      return await t.commit();
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  upsertOne = async (data, oldCustomerId, transaction) => {
    let customer,
      option = {};
    if (transaction) option.transaction = transaction;
    if (oldCustomerId) {
      customer = await this.model.findByPk(oldCustomerId);
      if (!customer) {
        throw new Error("Không tìm thấy thông tin khách hàng");
      }
    }
    if (!customer && data.phone) {
      const phone0x = formatPhone0x(data.phone);
      customer = await this.getOne({ phone0x });
    }

    if (customer) {
      if (typeof data.approve_status != "undefined" && data.approve_status !== customer.approve_status) {
        customer.approve_date = new Date();
      }
      const attributeValues = filterCustomerAtrributes(data);
      Object.entries(attributeValues).forEach(([key, val]) => {
        if (!customer[key]) {
          customer[key] = val;
        }
      });
      await customer.save(option);
    } else {
      const customerData = filterCustomerAtrributes(data);
      if (data.trust_score) {
        customerData.trust_score = data.trust_score;
        customerData.trusted_at = new Date();
      }
      if (data.approve_status) {
        customerData.approve_status = data.approve_status;
        customerData.approve_date = new Date();
      }
      customer = await this.model.create(customerData, option);
    }
    return customer;
  };

  getByPhone = async (phone) => {
    const phone0x = formatPhone0x(phone);
    const customer = await this.model.findOne({
      where: { phone0x },
      attributes: { exclude: ["password", "phone0x", "created_at", "updated_at", "deleted_at"] },
    });
    if (customer) {
      const result = customer.toJSON();
      result.customer_image = {};
      const customerImages = await db.media.findAll({
        where: { target_table: this.model.tableName, target_id: customer.id, target_type: "customer_image" },
      });
      customerImages.forEach((img) => (result.customer_image[img.media_name] = img.path));
      return result;
    }
    return null;
  };

  getDetail = async (id) => {
    const customer = await this.model.findOne({
      where: { id },
      attributes: { exclude: ["deleted_at"] },
    });
    if (customer) {
      const result = customer.toJSON();
      delete result.password;
      if (customer.other_data) {
        Object.entries(customer.other_data).forEach(([key, value], _) => (result[key] = value));
        delete result.other_data;
      }

      result.customer_image = {};
      (
        await MediaService.findAll(
          {
            target_table: this.tableName,
            target_id: id,
            target_type: "customer_image",
          },
          {
            attributes: ["path", "media_name"],
          }
        )
      ).forEach((media) => {
        if (!result.customer_image[media.media_name]) {
          result.customer_image[media.media_name] = [media.path];
        } else {
          result.customer_image[media.media_name].push(media.path);
        }
      });
      convertOutputFileFields(result);

      return result;
    }
    return null;
  };

  updateSuccessBookingNumber = async (customerId, options) => {
    const numberSuccessBooking = await db.booking.findOne({
      attributes: [[Sequelize.fn("COUNT", Sequelize.col("id")), "total"]],
      where: {
        customer_id: customerId,
        level: {
          [Op.in]: ["L8", "L9"],
        },
      },
      raw: true,
    });
    return await this.model.update(
      { number_success_booking: numberSuccessBooking.total },
      { where: { id: customerId }, ...options }
    );
  };

  resetPassword = async (customer) => {
    const password = randomString();
    customer.password = customer.generateHash(password);
    await customer.save();
    await sendEmail(
      customer.email,
      'Cấp lại mật khẩu trên hệ thống Vshare',
      `Vshare xin thông báo mật khẩu của quý khách là <strong>${password}</strong>.
      <br />
      Đây là email tự động. Quý khách vui lòng không gửi thư vào địa chỉ này. Mọi vướng mắc liên quan đến dịch vụ, Quý khách liên hệ với chăm sóc khách hàng của Vshare theo số điện thoại 0936309906.
      `);
  }
}

module.exports = new CustomerService();
