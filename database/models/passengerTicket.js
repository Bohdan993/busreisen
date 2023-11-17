'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PassengerTicket extends Model {
    static associate(models) {
      // Define associations here
      PassengerTicket.belongsTo(models.discount, { foreignKey: 'passengerDiscountId' });
      PassengerTicket.belongsTo(models.ticket, { foreignKey: 'ticketId' });
      PassengerTicket.belongsTo(models.passenger, { foreignKey: 'passengerId' });
    }
  }

  PassengerTicket.init(
    {      
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      passengerDiscountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'discount',
          key: 'id',
        },
      },
      discountCardNumber: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ticket',
          key: 'id',
        },
      },
      passengerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'passenger',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'passengerticket',
      tableName: 'passengertickets'
    }
  );

  return PassengerTicket;
};


