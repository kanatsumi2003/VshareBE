'use strict';
const {
  Model
} = require('sequelize');
const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class BookedSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.branch_vehicle, {
        foreignKey: 'id',
        sourceKey: 'branch_vehicle_id'
      })
      this.belongsTo(models.booking, {
        foreignKey: 'booking_id',
        targetKey: 'id'
      })
    }
  }
  BookedSchedule.init({
    branch_vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch_vehicle',
        key: 'id'
      }
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'booking',
        key: 'id'
      }
    },
    from_datetime: {
      type: DataTypes.DATE,
    },
    to_datetime: {
      type: DataTypes.DATE,
    },
    delivery_status: {
      type: DataTypes.STRING(10),
      defaultValue: Constants.DELIVERY_STATUS_PENDING,
    },
  }, {
    sequelize,
    tableName: 'booked_schedule',
    modelName: 'booked_schedule',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return BookedSchedule;
};