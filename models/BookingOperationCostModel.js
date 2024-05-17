'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OperationCost extends Model {
    /**
     * Chi phí vận hành trước và sau giao dịch nội bộ
     */
    static associate(models) {
      // define association here
    }
  }
  OperationCost.init({
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
    type: {
      type: DataTypes.STRING(10)
    },
  }, {
    sequelize,
    tableName: 'booking_operation_cost',
    modelName: 'booking_operation_cost',
    timestamps: false,
  });
  return OperationCost;
};