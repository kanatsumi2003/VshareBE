'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  Media.init({
    target_table: {
      type: DataTypes.STRING(30),
    },
    target_id: {
      type: DataTypes.INTEGER,
    },
    target_type: {
      type: DataTypes.STRING,
    },
    media_name: {
      type: DataTypes.STRING,
    },
    media_type: {
      type: DataTypes.STRING(100),
    },
    path: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    tableName: 'media',
    modelName: 'media',
    timestamps: false,
  });
  return Media;
};