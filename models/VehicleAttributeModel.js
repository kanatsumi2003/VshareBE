'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VehicleAttribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  VehicleAttribute.init({
    vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'vehicle',
        key: 'id'
      },
      onDelete: 'CASCADE',
      allowNull: true,
    },
    branch_vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch_vehicle',
        key: 'id'
      },
      onDelete: 'CASCADE',
      allowNull: true,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'attribute',
        key: 'id'
      },
      onDelete: 'CASCADE',
    },
    priority: {
      type: DataTypes.INTEGER,
    }
  }, {
    sequelize,
    tableName: 'vehicle_attribute',
    modelName: 'vehicle_attribute',
    timestamps: false,
  });
  return VehicleAttribute;
};