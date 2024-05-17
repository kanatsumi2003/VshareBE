'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BranchVehicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.branch, {
        foreignKey: 'branch_id',
        targetKey: 'id'
      })
      this.belongsTo(models.user, {
        foreignKey: 'owner_id',
        targetKey: 'id'
      })
      this.hasOne(models.vehicle, {
        foreignKey: 'id',
        sourceKey: 'vehicle_id'
      })
      this.belongsToMany(models.attribute, {
        through: models.vehicle_attribute,
        otherKey: 'attribute_id',
        foreignKey: 'branch_vehicle_id',
      })
      this.hasMany(models.customer_day_price_rule, {
        foreignKey: 'branch_vehicle_id',
        sourceKey: 'id',
      })
    }
  }
  BranchVehicle.init({
    vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'vehicle',
        key: 'id',
      }
    },
    branch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch',
        key: 'id',
      }
    },
    owner_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      }
    },
    license_number: {
      type: DataTypes.STRING(20),
    },
    name: {
      type: DataTypes.STRING,
    },
    rental_type: {
      type: DataTypes.STRING(10),
      defaultValue: 'day',
    },
    rental_from_date: {
      type: DataTypes.DATE,
    },
    rental_to_date: {
      type: DataTypes.DATE,
    },
    owner_day_price: {
      type: DataTypes.INTEGER,
    },
    owner_month_price: {
      type: DataTypes.INTEGER,
    },
    owner_month_km_limit: {
      type: DataTypes.SMALLINT,
    },
    owner_pin_price: {
      type: DataTypes.INTEGER,
    },
    reconciliation: {
      type: DataTypes.STRING(10),
    },
    revenue_rate: {
      type: DataTypes.FLOAT
    },
    contract_sign_date: {
      type: DataTypes.DATE,
    },
    contract_expired_date: {
      type: DataTypes.DATE,
    },
    contract_created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      }
    },
    customer_day_km_limit: {
      type: DataTypes.SMALLINT,
    },
    owner_overkm_price: {
      type: DataTypes.INTEGER,
    },
    customer_base_price: {
      type: DataTypes.INTEGER,
    },
    customer_weekend_price: {
      type: DataTypes.INTEGER,
    },
    customer_month_price: {
      type: DataTypes.INTEGER,
    },
    customer_month_km_limit: {
      type: DataTypes.SMALLINT,
    },
    customer_overkm_price: {
      type: DataTypes.INTEGER,
    },
    customer_overtime_price: {
      type: DataTypes.INTEGER,
    },
    position_company: {
      type: DataTypes.STRING,
    },
    position_username: {
      type: DataTypes.STRING,
    },
    position_password: {
      type: DataTypes.STRING,
    },
    has_maintain: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_insurance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    insurance_brand: {
      type: DataTypes.STRING,
    },
    insurance_phone: {
      type: DataTypes.STRING,
    },
    insurance_expire_date: {
      type: DataTypes.DATEONLY,
    },
    etc_username: {
      type: DataTypes.STRING,
    },
    etc_password: {
      type: DataTypes.STRING,
    },
    etc_balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    registry_date: {
      type: DataTypes.DATEONLY,
    },
    current_km: {
      type: DataTypes.INTEGER,
    },
    vehicle_color: {
      type: DataTypes.STRING,
    },
    other_data: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('other_data')) {
          return JSON.parse(this.getDataValue('other_data'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('other_data', JSON.stringify(value));
      },
      defaultValue: JSON.stringify({}),
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    tableName: 'branch_vehicle',
    modelName: 'branch_vehicle',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  return BranchVehicle;
};