'use strict'

const db = require('../models');
const AbstractBaseService = require('./AbstractBaseService');

class UserService extends AbstractBaseService {
  constructor() {
    super(db.user);
  }

  create = async data => {
    const t = await db.sequelize.transaction();
    try {
      const user = await this.model.create(data, { transaction: t });
      if (data.branch_id instanceof Array) {
        const userBranches = data.branch_id.map(bid => ({
          user_id: user.id,
          branch_id: bid,
        }))
        await db.user_branch.bulkCreate(userBranches, { transaction: t });
      }
      await t.commit();
      return user;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }

  updateById = async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
      if (data.branch_id instanceof Array) {
        await db.user_branch.destroy({ where: { user_id: id }, transaction: t })
        const userBranches = data.branch_id.map(bid => ({
          user_id: id,
          branch_id: bid,
        }))
        await db.user_branch.bulkCreate(userBranches, { transaction: t });
      }
      await this.model.update(data, { where: { id }, transaction: t });
      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }

  deleteById = async id => {
    const t = await db.sequelize.transaction();
    try {
      await this.model.destroy({ where: { id }, transaction: t });
      await db.user_branch.destroy({ where: { user_id: id }, transaction: t })
      await t.commit();
      return true;
    } catch (error) {
      t.rollback();
      throw error;
    }
  }
}

module.exports = new UserService();
