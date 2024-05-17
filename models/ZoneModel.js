'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Zone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  Zone.init({
    name: {
      type: DataTypes.STRING,
      comment: 'Tên tỉnh thành, quận huyện'
    },
    code: {
      type: DataTypes.STRING,
      comment: 'Mã tỉnh thành, quận huyện'
    },
    position: {
      type: DataTypes.INTEGER,
      comment: 'Thứ tự'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'ID cha'
    },
    left: {
      type: DataTypes.INTEGER,
    },
    right: {
      type: DataTypes.INTEGER,
    },
    level: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: 'Cấp 1-tỉnh thành, 2-quận huyện, 3-xã thị trấn'
    },
    status: {
      type: DataTypes.TINYINT,
      comment: 'Trạng thái'
    },
  }, {
    sequelize,
    tableName: 'zone',
    modelName: 'zone',
    timestamps: false,
  });
  return Zone;
};