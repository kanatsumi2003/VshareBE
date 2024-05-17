'use strict';

const { Model } = require('sequelize');
const { TASK_STATUS_PENDING } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class DeliveryTask extends Model {
    static associate(models) {
      this.belongsTo(models.booking, {
        foreignKey: 'booking_id',
        targetKey: 'id',
      })
      this.hasOne(models.user, {
        foreignKey: 'id',
        sourceKey: 'user_id'
      })
      this.hasOne(models.branch_vehicle, {
        foreignKey: 'id',
        sourceKey: 'branch_vehicle_id'
      })
    }
  }
  DeliveryTask.init({
    task_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'booking',
        key: 'id'
      }
    },
    branch_vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch_vehicle',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      },
    },
    do_at: DataTypes.DATE,
    task_status: {
      type: DataTypes.STRING(10),
      defaultValue: TASK_STATUS_PENDING
    }
  }, {
    sequelize,
    tableName: 'delivery_task',
    modelName: 'delivery_task',
    timestamps: false,
  });
  return DeliveryTask;
};