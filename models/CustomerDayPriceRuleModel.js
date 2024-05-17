'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerDayPriceRule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CustomerDayPriceRule.init({
    vehicle_price_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'vehicle_price_template',
        key: 'id'
      }
    },
    branch_vehicle_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
      references: {
        model: 'branch_vehicle',
        key: 'id'
      }
    },
    day_count_from: {
      type: DataTypes.INTEGER,
    },
    day_count_to: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    tableName: 'customer_day_price_rule',
    modelName: 'customer_day_price_rule',
    timestamps: false,
  });
  return CustomerDayPriceRule;
};