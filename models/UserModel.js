'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // this.hasMany(models.user_branch, {
      //   foreignKey: 'user_id',
      //   sourceKey: 'id'
      // })
      this.belongsToMany(models.branch, {
        through: models.user_branch,
        foreignKey: 'user_id',
        sourceKey: 'id'
      })
    }
  }
  User.init({
    user_type: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    fullname: DataTypes.STRING,
    password: DataTypes.STRING,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    sequelize,
    tableName: 'user',
    modelName: 'user',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  User.TYPE_ADMIN_USER = 0;
  User.TYPE_OWNER = 1;


  User.beforeCreate((user) => {
    return user.generateHash(user.password)
      .then(hash => {
        user.password = hash;
      })
  });

  User.prototype.generateHash = function (pwd) {
    return bcrypt.hash(pwd, bcrypt.genSaltSync(10));
  }

  User.prototype.validPassword = function (pwd) {
    return bcrypt.compare(pwd, this.password);
  }

  return User;
};