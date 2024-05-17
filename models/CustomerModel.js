"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const { formatPhone0x } = require("@util/FormatUtil");
const { genReferralCode } = require("@util/StringUtil");

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.booking, {
        foreignKey: "customer_id",
        sourceKey: "id",
      });
    }
  }
  Customer.init(
    {
      fullname: {
        type: DataTypes.STRING(200),
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      phone0x: {
        type: DataTypes.STRING(20),
      },
      zalo: {
        type: DataTypes.STRING,
      },
      birthday: {
        type: DataTypes.DATEONLY,
      },
      identity_number: {
        type: DataTypes.STRING(20),
      },
      identity_date: {
        type: DataTypes.DATEONLY,
      },
      driver_licence_number: {
        type: DataTypes.STRING(20),
      },
      driver_licence_date: {
        type: DataTypes.DATEONLY,
      },
      email: {
        type: DataTypes.STRING(100),
      },
      password: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      customer_note: {
        type: DataTypes.STRING,
      },
      approve_date: {
        type: DataTypes.DATE,
      },
      approve_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      approve_status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
      approve_note: {
        type: DataTypes.STRING(1000),
      },
      trust_score: {
        type: DataTypes.TINYINT,
      },
      trusted_at: {
        type: DataTypes.DATE,
      },
      referral_code: {
        type: DataTypes.STRING,
      },
      referral_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "customer",
          key: "id",
        },
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "branch",
          key: "id",
        },
      },
      other_data: {
        type: DataTypes.TEXT,
        get: function () {
          if (this.getDataValue("other_data")) {
            return JSON.parse(this.getDataValue("other_data"));
          }
          return null;
        },
        set: function (value) {
          this.setDataValue("other_data", JSON.stringify(value));
        },
        defaultValue: JSON.stringify({}),
      },
      number_success_booking: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      profile_status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "customer",
      modelName: "customer",
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  Customer.beforeCreate((customer) => {
    if (customer.phone) {
      customer.phone0x = formatPhone0x(customer.phone);
    }
    customer.referral_code = genReferralCode();
    return customer.generateHash(customer.password || process.env.DEFAULT_PASSWORD_CUSTOMER).then((hash) => {
      customer.password = hash;
    });
  });

  Customer.prototype.generateHash = function (pwd) {
    return bcrypt.hash(pwd, bcrypt.genSaltSync(10));
  };

  Customer.prototype.validPassword = function (pwd) {
    return bcrypt.compare(pwd, this.password);
  };

  return Customer;
};
