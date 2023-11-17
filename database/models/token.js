'use strict';
const { Model } = require('sequelize');
const UsersModel = require('./user');

module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    static associate(models) {
      // Define associations here
      Token.belongsTo(models.user, { foreignKey: 'userId' });
    }
  }

  Token.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deviceFingerprint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'token',
      tableName: 'tokens'
    }
  );

  return Token;
};


