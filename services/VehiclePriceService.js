"use strict";

const { Op } = require("sequelize");
const db = require("../models");
const AbstractBaseService = require("./AbstractBaseService");

class VehiclePriceTemplateService extends AbstractBaseService {
  constructor() {
    super(db.vehicle_price_template);
  }

  create = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const result = [];
      await this.model.destroy({ where: { branch_id: { [Op.in]: data.branch_id } }, transaction: t });
      await Promise.all(
        data.branch_id.map(async (branch_id) => {
          const branch = await db.branch.findOne({ where: { id: 9 } });
          console.log(branch);
          const template = await this.model.create({ ...data, branch_id }, { transaction: t });
          // Save customer price rules
          if (data.customer_day_price_rules) {
            await Promise.all(
              data.customer_day_price_rules.map(async (item) => {
                await db.customer_day_price_rule.create(
                  {
                    ...item,
                    vehicle_price_id: template.id,
                  },
                  { transaction: t }
                );
              })
            );
          }
          result.push(template.toJSON());
        })
      );
      await t.commit();
      return result;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  updateById = async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
      // Save customer price rules
      if (data.customer_day_price_rules) {
        await db.customer_day_price_rule.destroy({ where: { vehicle_price_id: id }, transaction: t, force: true });
        await Promise.all(
          data.customer_day_price_rules.map(async (item) => {
            await db.customer_day_price_rule.create(
              {
                ...item,
                vehicle_price_id: id,
              },
              { transaction: t }
            );
          })
        );
      }
      await this.model.update(data, { where: { id }, transaction: t });
      return await t.commit();
    } catch (error) {
      t.rollback();
      throw error;
    }
  };

  getById = async (id) => {
    const template = await this.model.findByPk(id);
    if (!template) return;
    const data = template.toJSON();
    data.customer_day_price_rules = await template.getCustomer_day_price_rules();
    return data;
  };

  deleteById = async (id) => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.destroy({ where: { id }, transaction: t });
      // Delete all price rule configs
      await db.customer_day_price_rule.destroy({ where: { vehicle_price_id: id }, transaction: t, force: true });
      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error;
    }
  };
}

module.exports = new VehiclePriceTemplateService();
