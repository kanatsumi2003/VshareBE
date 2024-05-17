'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromotionEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PromotionEvent.init({
    branch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING
    },
    from_date: {
      type: DataTypes.DATE,
    },
    to_date: {
      type: DataTypes.DATE,
    },
    price: {
      type: DataTypes.INTEGER,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    tableName: 'promotion_event',
    modelName: 'promotion_event',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return PromotionEvent;
};