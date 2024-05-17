'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserBranch extends Model {
    static associate(models) {
      // define association here
      // this.belongsTo(models.branch, {
      //   foreignKey: 'branch_id',
      //   targetKey: 'id',
      // })
      // this.belongsTo(models.user, {
      //   foreignKey: 'user_id',
      //   targetKey: 'id',
      // })
      this.hasMany(models.branch, {
        sourceKey: 'branch_id',
        foreignKey: 'id'
      }),
      this.hasMany(models.user, {
        sourceKey: 'user_id',
        foreignKey: 'id'
      })
    }
  }
  UserBranch.init({
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'branch',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
  }, {
    sequelize,
    tableName: 'user_branch',
    modelName: 'user_branch',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })

  return UserBranch;
};