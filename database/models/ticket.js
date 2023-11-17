'use strict';
const { Model } = require('sequelize');
const constants = require('../../helpers/constants');

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      // Define associations here
      Ticket.belongsTo(models.busflight, { foreignKey: 'busFlightFromId' });
      Ticket.belongsTo(models.busflight, { foreignKey: 'busFlightToId' });
      Ticket.belongsTo(models.city, { foreignKey: 'originId' });
      Ticket.belongsTo(models.city, { foreignKey: 'destinationId' });
      Ticket.belongsToMany(models.passenger, { through: 'passengerticket' });
    }
  }

  Ticket.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      dateOfDeparture: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      dateOfReturn: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      busFlightFromId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'busflight',
          key: 'id',
        },
      },
      busFlightToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'busflight',
          key: 'id',
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      currencyAbbr: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: [constants.ONE_WAY, constants.ROUND, constants.OPEN_DATE],
      },
      signature: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      status: {
        type: DataTypes.ENUM,
        values: [
          constants.TICKET_STATUS_NOT_PAYED,
          constants.TICKET_STATUS_PAYED,
          constants.TICKET_STATUS_HALF_USED,
          constants.TICKET_STATUS_USED,
        ],
        defaultValue: constants.TICKET_STATUS_NOT_PAYED,
        allowNull: false,
      },
      dateOfFirstUsage: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      hasDiscount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      discountPercentage: {
        type: DataTypes.FLOAT(3, 1),
        allowNull: false,
      },
      originId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'city',
          key: 'id',
        },
      },
      destinationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'city',
          key: 'id',
        },
      },
      children: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ticket',
      tableName: 'tickets'
    }
  );

  return Ticket;
};

