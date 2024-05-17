'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerTrustScore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CustomerTrustScore.init({
    customer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'customer',
        key: 'id'
      }
    },
    trust_score_config_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'trust_score_config',
        key: 'id'
      }
    },
    note: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    tableName: 'customer_trust_score',
    modelName: 'customer_trust_score',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return CustomerTrustScore;
};