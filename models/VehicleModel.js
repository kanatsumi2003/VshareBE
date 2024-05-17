'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      this.hasOne(models.vehicle_brand, {
        foreignKey: 'id',
        sourceKey: 'brand_id'
      })
      this.hasOne(models.vehicle_model, {
        foreignKey: 'id',
        sourceKey: 'model_id'
      })
      this.belongsToMany(models.attribute, {
        through: models.vehicle_attribute,
        otherKey: 'attribute_id',
        foreignKey: 'vehicle_id',
      })
      this.hasMany(models.branch_vehicle, {
        sourceKey: 'id',
        foreignKey: 'vehicle_id'
      })
    }
  }
  Vehicle.init({
    vehicle_type: {
      type: DataTypes.STRING(10),
    },
    brand_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'vehicle_brand',
        key: 'id',
      }
    },
    name: {
      type: DataTypes.STRING,
      comment: 'Tên xe'
    },
    model_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'vehicle_model',
        key: 'id',
      }
    },
    vehicle_class: {
      type: DataTypes.STRING(10),
    },
    version: {
      type: DataTypes.STRING,
    },
    seats: {
      type: DataTypes.TINYINT,
    },
    transmission: {
      type: DataTypes.STRING(10),
    },
    fuel: {
      type: DataTypes.STRING(10),
    },
    fuel_consumption: {
      type: DataTypes.STRING,
    },
    style: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    tableName: 'vehicle',
    modelName: 'vehicle',
    timestamps: false,
  });

  return Vehicle;
};