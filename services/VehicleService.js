'use strict'

const { buildQuery } = require('../helpers/QueryHelper');
const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class VehicleService extends AbstractBaseService {
  constructor() {
    super(db.vehicle);
  }

  getAll = (params) => {
    const query = buildQuery(params);
    return this.model.findAndCountAll({
      ...query,
      include: db.attribute
    });
  }

  create = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const vehicle = await this.model.create(data, { transaction: t });
      await Promise.all(data.attributes.map(async attrId => {
        await db.vehicle_attribute.create({
          vehicle_id: vehicle.id,
          attribute_id: attrId,
        }, { transaction: t })
      }))
      await t.commit();
      return vehicle;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  updateById = async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.update(data, { where: { id }, transaction: t });
      if (Array.isArray(data.attributes)) {
        await db.vehicle_attribute.destroy({ where: { vehicle_id: id }, transaction: t });
        await Promise.all(data.attributes.map(async attrId => {
          await db.vehicle_attribute.create({
            vehicle_id: id,
            attribute_id: attrId,
          }, { transaction: t })
        }))
      }
      return await t.commit();
    } catch (error) {
      t.rollback();
      throw error;
    }
  }

  getById = async (id) => {
    const vehicle = await this.model.findByPk(id);
    if (!vehicle) return;
    const data = vehicle.toJSON();
    const attributes = await vehicle.getAttributes() || [];
    if (attributes.length) {
      data.attributes = attributes.map(a => a.id);
    }
    return data;
  }
}

module.exports = new VehicleService();
