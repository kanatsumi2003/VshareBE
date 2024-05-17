'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotifyLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NotifyLog.init({
    noty_app: {
      type: DataTypes.TINYINT,
    },
    noty_app_type: {
      type: DataTypes.TINYINT,
      comment: '1-Backend, 2-Customer'
    },
    user_id: {
      type: DataTypes.INTEGER,
      comment: 'ID người nhận thông báo'
    },
    noty_type: {
      type: DataTypes.STRING,
      comment: 'Kiểu thông báo'
    },
    json_data: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    tableName: 'notify_log',
    modelName: 'notify_log',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return NotifyLog;
};