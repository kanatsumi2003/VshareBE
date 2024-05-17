'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VehicleModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.vehicle_brand, {
        foreignKey: 'brand_id',
        targetKey: 'id',
      })
    }
  }
  VehicleModel.init({
    brand_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'vehicle_brand',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    tableName: 'vehicle_model',
    modelName: 'vehicle_model',
    timestamps: false,
  });
  return VehicleModel;
};