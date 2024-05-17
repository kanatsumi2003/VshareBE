'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TrustScoreConfig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.trust_score_config, {
        foreignKey: 'parent_id',
        sourceKey: 'id',
        as: 'trust_scores',
      })
    }
  }
  TrustScoreConfig.init({
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'trust_score_config',
        key: 'id'
      }
    },
    path: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    point: {
      type: DataTypes.TINYINT,
    },
    note: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    tableName: 'trust_score_config',
    modelName: 'trust_score_config',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return TrustScoreConfig;
};