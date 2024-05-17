'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MaintainSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  MaintainSchedule.init({
    branch_vehicle_id: {
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'branch_vehicle',
        key: 'id'
      }
    },
    km: {
      type: DataTypes.INTEGER,
    },
    date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    tableName: 'maintain_schedule',
    modelName: 'maintain_schedule',
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  MaintainSchedule.STATUS_PENDING = 0;
  MaintainSchedule.STATUS_DONE = 1;

  return MaintainSchedule;
};