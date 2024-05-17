'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VehiclePriceTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.customer_day_price_rule, {
        foreignKey: 'vehicle_price_id',
        sourceKey: 'id',
      })
      this.belongsTo(models.branch, {
        foreignKey: 'branch_id',
        targetKey: 'id',
      })
    }
  }
  VehiclePriceTemplate.init({
    branch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch',
        key: 'id',
      }
    },
    vehicle_class: {
      allowNull: false,
      type: DataTypes.STRING(10),
    },
    base_price: {
      type: DataTypes.INTEGER,
    },
    weekend_price: {
      type: DataTypes.INTEGER,
    },
    month_price: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'vehicle_price_template',
    tableName: 'vehicle_price_template',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return VehiclePriceTemplate;
};