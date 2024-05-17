"use strict";

const db = require("../models");
const AbstractBaseService = require("./AbstractBaseService");

class TrustScoreConfigService extends AbstractBaseService {
  constructor() {
    super(db.trust_score_config);
  }

  create = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const parent = await this.model.create(data, { transaction: t })
      await this.model.bulkCreate(data.trust_scores.map(ts => ({
        name: ts.name,
        point: ts.point,
        parent_id: parent.id
      })), { transaction: t });
      await t.commit();
      data.id = parent.id;
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  updateById = async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.update(data, { where: { id }, transaction: t })
      await this.model.destroy({ where: { parent_id: id }, transaction: t })
      await this.model.bulkCreate(data.trust_scores.map(ts => ({
        name: ts.name,
        point: ts.point,
        parent_id: id
      })), { transaction: t });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  deleteById = async (id) => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.destroy({ where: { parent_id: id }, transaction: t })
      await this.model.destroy({ where: { id }, transaction: t })
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new TrustScoreConfigService();
