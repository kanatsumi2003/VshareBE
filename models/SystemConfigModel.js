'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SystemConfig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SystemConfig.init({
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    value: {
      type: DataTypes.TEXT,
      get: function () {
        return JSON.parse(this.getDataValue('value'));
      },
      set: function (value) {
        this.setDataValue('value', JSON.stringify(value));
      },
    }
  }, {
    sequelize,
    tableName: 'system_config',
    modelName: 'system_config',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return SystemConfig;
};