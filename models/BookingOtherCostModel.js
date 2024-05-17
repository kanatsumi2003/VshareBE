'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OtherCost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OtherCost.init({
    booking_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'booking',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.STRING
    },
    cost: {
      type: DataTypes.INTEGER
    },
    note: {
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    tableName: 'booking_other_cost',
    modelName: 'booking_other_cost',
    timestamps: false,
  });
  return OtherCost;
};