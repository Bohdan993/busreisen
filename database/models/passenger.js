'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    static associate(models) {
      // Define associations here
      Passenger.belongsToMany(models.ticket, { through: 'passengerticket' });
    }
  }

  Passenger.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(14),
        unique: true,
        allowNull: false,
      },
      additionalPhone: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'passenger',
      tableName: 'passengers'
    }
  );

  return Passenger;
};


