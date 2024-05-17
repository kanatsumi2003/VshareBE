'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VehicleBrand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.vehicle_model, {
        sourceKey: 'id',
        foreignKey: 'brand_id',
      })
    }
  }
  VehicleBrand.init({
    vehicle_type: {
      type: DataTypes.STRING(10),
    },
    name: {
      type: DataTypes.STRING,
    },
    position: {
      type: DataTypes.SMALLINT,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'vehicle_brand',
    modelName: 'vehicle_brand',
    timestamps: false,
  });
  return VehicleBrand;
};