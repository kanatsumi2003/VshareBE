'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.zone, {
        foreignKey: 'province_id',
        targetKey: 'id',
        as: 'province'
      })
      this.belongsTo(models.zone, {
        foreignKey: 'district_id',
        targetKey: 'id',
        as: 'district'
      })
      this.belongsToMany(models.user, {
        through: models.user_branch,
        foreignKey: 'branch_id',
        sourceKey: 'id'
      })
    }
  }
  Branch.init({
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    province_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'zone',
        key: 'id'
      }
    },
    district_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'zone',
        key: 'id'
      }
    },
    address: DataTypes.STRING,
    full_address: DataTypes.STRING(1000),
    latlng: {
      type: DataTypes.STRING,
    },
    rental_time_from: {
      type: DataTypes.STRING(5),
    },
    rental_time_to: {
      type: DataTypes.STRING(5),
    },
    limit_km: {
      type: DataTypes.INTEGER,
    },
    overkm_fee: {
      type: DataTypes.INTEGER,
    },
    overtime_fee: {
      type: DataTypes.INTEGER,
    },
    free_delivery_km: {
      type: DataTypes.TINYINT,
    },
    delivery_fee: {
      type: DataTypes.INTEGER,
    },
    procedure: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('procedure')) {
          return JSON.parse(this.getDataValue('procedure'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('procedure', JSON.stringify(value));
      },
    },
    holiday_event_price: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('holiday_event_price')) {
          return JSON.parse(this.getDataValue('holiday_event_price'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('holiday_event_price', JSON.stringify(value));
      },
    },
    week_days_price: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('week_days_price')) {
          return JSON.parse(this.getDataValue('week_days_price'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('week_days_price', JSON.stringify(value));
      },
    },
    agent_name: DataTypes.STRING,
    agent_phone: DataTypes.STRING,
    other_data: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('other_data')) {
          return JSON.parse(this.getDataValue('other_data'));
        }
        return null
      },
      set: function (value) {
        this.setDataValue('other_data', JSON.stringify(value));
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    tableName: 'branch',
    modelName: 'branch',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });
  return Branch;
};