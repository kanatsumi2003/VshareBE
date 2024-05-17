'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.branch_vehicle, {
        through: models.vehicle_attribute,
        otherKey: 'branch_vehicle_id',
        foreignKey: 'attribute_id',
      })
    }
  }
  Attribute.init({
    name: {
      type: DataTypes.STRING,
    },
    icon: {
      type: DataTypes.STRING,
    },
    priority: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    }
  }, {
    sequelize,
    tableName: 'attribute',
    modelName: 'attribute',
    timestamps: false,
  });
  return Attribute;
};