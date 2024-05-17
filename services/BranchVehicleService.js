/* eslint-disable indent */
'use strict'

const moment = require('moment');
const momentTz = require('moment-timezone');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { buildQuery } = require('../helpers/QueryHelper');
const db = require('../models');
const Constants = require('../constants');
const AbstractBaseService = require('./AbstractBaseService');
const MediaService = require('./MediaService');

function filterValues(data) {
  const branchVehicle = {}
  Object.keys(db.branch_vehicle.rawAttributes).forEach(fieldKey => {
    if (typeof data[fieldKey] != 'undefined') {
      switch (fieldKey) {
        case 'rental_from_date':
        case 'rental_to_date':
        case 'insurance_expire_date':
        case 'registry_date':
        case 'contract_sign_date':
        case 'contract_created_by':
          branchVehicle[fieldKey] = data[fieldKey] || null;
          break;

        default:
          branchVehicle[fieldKey] = data[fieldKey];
          break;
      }
    }
  })
  return branchVehicle;
}

function filterOtherFields(data) {
  const otherFields = {};
  const keys = [
    'latest_car_image',
    'latest_km',
    'latest_fuel',
    'manufacture_year',
    'contract_note',
    'contract_duration_month',
  ];
  keys.forEach(key => {
    if (typeof data[key] != 'undefined') otherFields[key] = data[key]
  });
  return otherFields;
}

class BranchVehicleService extends AbstractBaseService {
  constructor() {
    super(db.branch_vehicle);
  }

  _tableName = db.branch_vehicle.tableName;

  create = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      if (data.has_insurance === false) {
        delete data.insurance_brand
        delete data.insurance_phone
        delete data.insurance_expire_date
      }
      data.other_data = filterOtherFields(data);
      const branchVehicle = await this.model.create(filterValues(data), { transaction: t });
      // Save attributes
      if (data.attributes) {
        await Promise.all((data.attributes.map(async (attrId, index) => {
          await db.vehicle_attribute.create({
            branch_vehicle_id: branchVehicle.id,
            attribute_id: attrId,
            priority: index,
          }, {
            transaction: t,
          });
        })));
      }
      // Save customer price rules
      if (data.customer_day_price_rules) {
        await Promise.all(data.customer_day_price_rules.map(async item => {
          await db.customer_day_price_rule.create({
            ...item,
            branch_vehicle_id: branchVehicle.id,
          }, { transaction: t });
        }))
      }
      if (data.car_image) {
        await MediaService.saveMedia(branchVehicle.id, data.car_image, 'car_image', this._tableName, { transaction: t });
      }
      if (data.latest_car_image) {
        await MediaService.saveMedia(branchVehicle.id, data.latest_car_image, 'latest_car_image', this._tableName, { transaction: t });
      }
      if (data.car_document_image) {
        const carDocumentImage = {}
        Object.entries(data.car_document_image).forEach(([key, val]) => carDocumentImage[key] = val.indexOf(',') ? val.split(',') : []);
        await MediaService.saveMedia(branchVehicle.id, carDocumentImage, 'car_document_image', this._tableName, { transaction: t });
      }
      await t.commit();
      return branchVehicle;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  getAll = (params, options) => {
    const query = buildQuery(params);
    if (query.code) {
      query.where.code = {
        [Op.like]: `%${query.code}%`
      }
    }
    return this.model.findAndCountAll({
      ...query,
      attributes: [
        'id',
        'name',
        'customer_base_price',
        'customer_weekend_price',
        'customer_month_price',
        'customer_month_km_limit',
        'customer_overkm_price',
        'customer_overtime_price',
      ],
      include: [
        { model: db.branch, attributes: ['name'] },
        { model: db.user, attributes: ['fullname'] },
      ],
      ...options,
    });
  }

  updateById = async (id, data, oldData) => {
    const t = await db.sequelize.transaction();
    try {
      if (data.has_insurance === false) {
        data.insurance_brand = null
        data.insurance_phone = null
        data.insurance_expire_date = null
      }
      if (data.contract_sign_date || data.contract_duration_month) {
        const contractExpiredDate = moment((data.contract_sign_date || oldData.contract_sign_date))
          .add((data.contract_duration_month || oldData.contract_duration_month), 'month')
          .format();
        if (moment(contractExpiredDate).isValid()) {
          data.contract_expired_date = contractExpiredDate;
        }
      }
      // Save attributes
      if (data.attributes) {
        await db.vehicle_attribute.destroy({ where: { branch_vehicle_id: id }, transaction: t });
        await Promise.all((data.attributes.map(async (attrId, index) => {
          await db.vehicle_attribute.create({
            branch_vehicle_id: id,
            attribute_id: attrId,
            priority: index,
          }, {
            transaction: t,
          });
        })));
      }
      // Save customer price rules
      if (data.customer_day_price_rules) {
        await db.customer_day_price_rule.destroy({ where: { branch_vehicle_id: id }, transaction: t, force: true })
        await Promise.all(data.customer_day_price_rules.map(async item => {
          await db.customer_day_price_rule.create({
            ...item,
            branch_vehicle_id: id,
          }, { transaction: t });
        }))
      }
      if (data.car_image) {
        await MediaService.saveMedia(id, data.car_image, 'car_image', this._tableName, { transaction: t });
      }
      if (data.latest_car_image) {
        await MediaService.saveMedia(id, data.latest_car_image, 'latest_car_image', this._tableName, { transaction: t });
      }
      if (data.car_document_image) {
        const carDocumentImage = {}
        Object.entries(data.car_document_image).forEach(([key, val]) => carDocumentImage[key] = val.indexOf(',') ? val.split(',') : []);
        await MediaService.saveMedia(id, carDocumentImage, 'car_document_image', this._tableName, { transaction: t });
      }
      // Save owner contract paper paths
      if (data.contract_paper) {
        await MediaService.saveMedia(id, data.contract_paper, "owner_contract_paper", this.tableName, { transaction: t });
      }
      // Save contract images
      if (data.contract_images && data.contract_images.length) {
        const ownerContractImage = {};
        data.contract_images.forEach((img, i) => (ownerContractImage[i] = img));
        await MediaService.saveMedia(id, ownerContractImage, "owner_contract_image", this.tableName, {
          transaction: t,
        });
      }
      data.other_data = { ...oldData.other_data, ...filterOtherFields(data) };
      await this.model.update(filterValues(data), { where: { id }, transaction: t });
      return await t.commit();
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  getVehicleDetail = async (id) => {
    const vehicle = await this.model.findByPk(id);
    if (!vehicle) return;
    const data = vehicle.toJSON();
    if (vehicle && vehicle.branch_id) {
      data.branch = await vehicle.getBranch({ attributes: ['id', 'name'] });
    }
    if (vehicle && vehicle.owner_id) {
      data.owner = await vehicle.getUser({ attributes: ['id', 'username', 'fullname', 'email'] });
    }
    data.vehicle = await vehicle.getVehicle();
    const attributes = await vehicle.getAttributes({ attributes: ['id', 'name', 'icon'] }) || [];
    data.attributes = attributes.map(a => a.id);
    data.customer_day_price_rules = await vehicle.getCustomer_day_price_rules({ attributes: ['day_count_from', 'day_count_to', 'price'] });

    data.car_image = {}
    const carImages = await db.media.findAll({ where: { target_table: this._tableName, target_id: id, target_type: 'car_image' } })
    carImages.forEach(img => data.car_image[img.media_name] = img.path)

    data.latest_car_image = {}
    const latestCarImages = await db.media.findAll({ where: { target_table: this._tableName, target_id: id, target_type: 'latest_car_image' } })
    latestCarImages.forEach(img => data.latest_car_image[img.media_name] = img.path)
    if (data.other_data) {
      Object.entries(data.other_data).map(([key, val]) => {
        if (key === 'latest_car_image' && val && Object.keys(val).length) {
          Object.entries(val).forEach(([key1, val1]) => {
            if (val1) {
              data.latest_car_image[key1] = val1;
            }
          })
        } else {
          data[key] = val;
        }
      });
      delete data.other_data;
    }
    data.car_document_image = {}
    const carDocumentImages = await MediaService.findAll({ target_table: this._tableName, target_id: id, target_type: 'car_document_image' });
    carDocumentImages.forEach(img => {
      if (!data.car_document_image[img.media_name]) {
        data.car_document_image[img.media_name] = img.path
      } else {
        data.car_document_image[img.media_name] += ',' + img.path
      }
    })
    return data;
  }

  deleteById = async (id) => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.destroy({ where: { id }, transaction: t });
      // Delete all price rule configs
      await db.customer_day_price_rule.destroy({ where: { branch_vehicle_id: id }, transaction: t, force: true });
      // Delete all vehicle attributes
      await db.vehicle_attribute.destroy({ where: { branch_vehicle_id: id }, transaction: t });
      await db.media.destroy({ where: { target_table: this._tableName, target_id: id }, transaction: t, force: true });
      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error
    }
  }

  /**
   * Insert or update customer_day_price_rule by branch_vehicle_id
   * @param {int} id branch_vehicle id
   * @param {Array} data List customer_day_price_rule object
   * @returns exception or true
   */
  changeCustomerDayPriceRules = async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
      await db.customer_day_price_rule.destroy({ where: { branch_vehicle_id: id }, transaction: t, force: true })
      await Promise.all(data.map(async item => {
        await db.customer_day_price_rule.create({
          ...item,
          branch_vehicle_id: id,
        }, { transaction: t });
      }))
      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }

  getCustomerDayPriceRules = (id) => {
    return db.customer_day_price_rule.findAndCountAll({ where: { branch_vehicle_id: id } })
  }

  updateOtherData = async (id, data, options) => {
    const branchVehicle = await this.getOne({ id }, { attributes: ['id', 'other_data'] });
    if (branchVehicle) {
      const otherData = filterOtherFields(data);
      if (otherData.latest_car_image) {
        const newLatestCarImage = {}
        Object.entries(otherData.latest_car_image).forEach(([key, val]) => {
          if (val) newLatestCarImage[key] = val;
        })
        if (Object.keys(newLatestCarImage).length) {
          otherData.latest_car_image = newLatestCarImage;
        }
      }
      branchVehicle.other_data = { ...branchVehicle.other_data, ...otherData };
      await branchVehicle.save({ ...options });
    }
  }

  /**
   * 
   * @param {String} param0 C or M
   * @param {Integer} param1 Branch ID
   * @param {String} param2 format HH:mm DD-MM-YYYY
   * @param {String} param3 format HH:mm DD-MM-YYYY
   * @returns 
   */
  getAvaiableVehicles = ({
    vehicle_type,
    transmission,
    brand_id,
    branch_id,
    from_date,
    to_date,
    price_from,
    price_to,
  }) => {
    const whereFrom = momentTz.tz(from_date, "HH:mm DD-MM-YYYY", "Asia/Ho_Chi_Minh").format();
    const whereTo = momentTz.tz(to_date, "HH:mm DD-MM-YYYY", "Asia/Ho_Chi_Minh").format();

    const where = {
      branch_id,
      id: {
        [Op.notIn]: Sequelize.literal(
          `(SELECT branch_vehicle_id FROM ${db.booked_schedule.tableName} WHERE (from_datetime BETWEEN '${whereFrom}' AND '${whereTo}') AND (to_datetime BETWEEN '${whereFrom}' AND '${whereTo}'))`
        ),
      },
      active: true,
    }
    if (price_from && price_to) {
      where.customer_base_price = {
        [Op.between]: [price_from, price_to]
      }
    } else if (price_from) {
      where.customer_base_price = {
        [Op.gte]: price_from
      }
    } else if (price_to) {
      where.customer_base_price = {
        [Op.lte]: price_to
      }
    } else {
      where.customer_base_price = {
        [Op.ne]: null
      }
    }

    const whereVehicle = {
      vehicle_type,
    }
    if (brand_id) {
      whereVehicle.brand_id = brand_id;
    }
    if (transmission) {
      whereVehicle.transmission = transmission;
    }

    return db.branch_vehicle.findAll({
      attributes: ['id', "customer_base_price", "other_data"],
      where,
      include: [
        {
          model: db.vehicle,
          required: true,
          attributes: { exclude: ["id", "vehicle_type", "model_id", "brand_id", "name"] },
          where: whereVehicle,
          include: [
            { model: db.vehicle_brand, attributes: ["id", "name"], required: true },
            { model: db.vehicle_model, attributes: ["name"], required: true },
          ],
        },
      ],
      group: ["customer_base_price", "vehicle_id"],
    });
  }

  getListVehicles = (params) => {
    const whereVehicle = {}
    if (params.vehicle_class) {
      whereVehicle.vehicle_class = params.vehicle_class;
      delete params.vehicle_class;
    }
    if (params.price_from || params.price_to) {
      params.customer_base_price = {
        [Op.between]: [params.price_from || 0, params.price_to || 999999999]
      }
      delete params.price_from;
      delete params.price_to;
    }

    return this.model.findAll({
      where: {
        ...params,
        active: true,
      },
      include: [
        { model: db.vehicle, attributes: ['image', 'vehicle_class'], where: whereVehicle, required: true },
      ],
      attributes: ['id', 'name', 'customer_base_price', 'customer_weekend_price'],
      group: ['id'],
      order: [['vehicle', 'vehicle_class', 'ASC']],
      raw: true,
    })
  }

  getRentalTypeLabel = type => {
    switch (type) {
      case Constants.RENTAL_TYPE_DAY:
        return 'UT ngày';
      case Constants.RENTAL_TYPE_MONTH:
        return 'Thuê khô';
      default:
        return '';
    }
  }

  changeOwner = async (fromId, toId, data) => {
    const t = await db.sequelize.transaction();
    try {
      // Remove the owner from the old vehicle
      await this.model.update({ owner_id: null }, {
        where: { id: fromId },
        transaction: t,
      });
      // Update owner to the new vehicle
      await this.update(data, {
        where: { id: toId },
        transaction: t,
      });
      await t.commit();
    } catch (error) {
      t.rollback();
      throw error;
    }
  }

  removeOwner = async (id) => {
    return this.model.update({ owner_id: null }, {
      where: { id },
    });
  }
}

module.exports = new BranchVehicleService();
