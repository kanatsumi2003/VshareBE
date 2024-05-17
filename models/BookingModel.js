'use strict';

const { Model } = require('sequelize');
const Constants = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
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
      this.belongsTo(models.customer, {
        foreignKey: 'customer_id',
        targetKey: 'id'
      })
      this.hasOne(models.branch_vehicle, {
        foreignKey: 'id',
        sourceKey: 'estimate_branch_vehicle_id',
        as: 'estimate_branch_vehicle',
      })
      this.hasOne(models.branch_vehicle, {
        foreignKey: 'id',
        sourceKey: 'actual_branch_vehicle_id',
        as: 'actual_branch_vehicle',
      })
      this.hasOne(models.user, {
        foreignKey: 'id',
        sourceKey: 'give_user_id',
        as: 'give_user'
      })
      this.hasOne(models.user, {
        foreignKey: 'id',
        sourceKey: 'return_user_id',
        as: 'return_user'
      })
      this.hasOne(models.user, {
        foreignKey: 'id',
        sourceKey: 'saler_id',
        as: 'saler'
      })
      this.hasMany(models.booking_other_cost, {
        foreignKey: 'booking_id',
        sourceKey: 'id'
      })
      this.hasMany(models.booking_operation_cost, {
        foreignKey: 'booking_id',
        sourceKey: 'id'
      })
      this.hasOne(models.booked_schedule, {
        foreignKey: 'booking_id',
        sourceKey: 'id',
      })
    }
  }
  Booking.init({
    source: {
      type: DataTypes.STRING(50),
    },
    code: {
      type: DataTypes.STRING(50),
    },
    vehicle_type: {
      type: DataTypes.STRING(10),
    },
    customer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'customer',
        key: 'id'
      },
      onDelete: 'NO ACTION',
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    fullname: {
      type: DataTypes.STRING(100),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    branch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch',
        key: 'id'
      },
      onDelete: 'NO ACTION',
    },
    estimate_branch_vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch_vehicle',
        key: 'id'
      },
      onDelete: 'NO ACTION',
    },
    actual_branch_vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'branch_vehicle',
        key: 'id'
      },
      onDelete: 'NO ACTION',
    },
    rental_type: {
      type: DataTypes.STRING(10),
    },
    estimate_price: {
      type: DataTypes.INTEGER,
    },
    actual_price: {
      type: DataTypes.INTEGER,
    },
    total_amount: {
      type: DataTypes.INTEGER,
    },
    note: {
      type: DataTypes.STRING,
    },
    receive_type: {
      type: DataTypes.STRING(10),
    },
    estimate_receive_datetime: {
      type: DataTypes.DATE,
    },
    estimate_return_datetime: {
      type: DataTypes.DATE,
    },
    estimate_rental_duration: {
      type: DataTypes.STRING(9),
    },
    actual_receive_datetime: {
      type: DataTypes.DATE,
    },
    actual_return_datetime: {
      type: DataTypes.DATE,
    },
    actual_rental_duration: {
      type: DataTypes.STRING(9),
    },
    give_user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    return_user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    saler_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    level: {
      type: DataTypes.STRING(2),
    },
    deposit: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('deposit')) {
          return JSON.parse(this.getDataValue('deposit'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('deposit', JSON.stringify(value));
      },
      defaultValue: "{}",
    },
    payment_method: {
      type: DataTypes.STRING(20),
    },
    vat: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('vat')) {
          return JSON.parse(this.getDataValue('vat'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('vat', JSON.stringify(value));
      },
      defaultValue: "{}",
    },
    other: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('other')) {
          return JSON.parse(this.getDataValue('other'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('other', JSON.stringify(value));
      },
      defaultValue: "{}",
    },
    prepay: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_addon_amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    add_ons: {
      type: DataTypes.TEXT,
      get: function () {
        if (this.getDataValue('add_ons')) {
          return JSON.parse(this.getDataValue('add_ons'));
        }
        return null;
      },
      set: function (value) {
        this.setDataValue('add_ons', JSON.stringify(value));
      },
      defaultValue: JSON.stringify([]),
    },
    delivery_fee: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    booking_status: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    discount_code: {
      type: DataTypes.STRING,
    },
    discount_amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    vat_cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    other_cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    operation_cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    post_operation_cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    revenue: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    tableName: 'booking',
    modelName: 'booking',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeCreate: (data) => {
        if (!data.level) {
          data.level = 'C3';
        }
      },
      afterCreate: (data) => {
        // Create delivery schedule
        const branchVehicleId = data.actual_branch_vehicle_id || data.estimate_branch_vehicle_id;
        const receiveTask = {
          task_type: Constants.TASK_TYPE_RECEIVE,
          booking_id: data.id,
          branch_vehicle_id: branchVehicleId,
        };
        if (data.actual_receive_datetime || data.estimate_receive_datetime) {
          receiveTask.do_at = data.actual_receive_datetime || data.estimate_receive_datetime;
        }
        if (data.give_user_id) {
          receiveTask.user_id = data.give_user_id;
        }

        const returnTask = {
          task_type: Constants.TASK_TYPE_RETURN,
          booking_id: data.id,
          branch_vehicle_id: branchVehicleId,
        };
        if (data.actual_return_datetime || data.estimate_return_datetime) {
          returnTask.do_at = data.actual_return_datetime || data.estimate_return_datetime;
        }
        if (data.return_user_id) {
          receiveTask.user_id = data.return_user_id;
        }

        const deliveryData = [receiveTask, returnTask];
        try {
          sequelize.models.delivery_task.bulkCreate(deliveryData);
        } catch (error) {
          console.error('Error creating delivery_task:', error);
        }
      },
      beforeSave: (data) => {
        // Calculate revenue
        data.revenue = data.actual_price + data.other_cost - data.operation_cost - data.post_operation_cost;
      },
    }
  });

  return Booking;
};