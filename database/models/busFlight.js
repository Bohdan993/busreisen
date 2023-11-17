'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusFlight extends Model {
    static associate(models) {
      // Define associations here
      BusFlight.belongsTo(models.route, { foreignKey: 'routeId' });
      BusFlight.hasOne(models.discount);
      BusFlight.hasMany(models.ticket, { foreignKey: 'busFlightFromId' });
      BusFlight.hasMany(models.ticket, { foreignKey: 'busFlightToId' });
    }
  }

  BusFlight.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      allSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      freeSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      routeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'route',
          key: 'id',
        },
      },
      dateOfDeparture: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'busflight',
      tableName: 'busflights'
    }
  );

  return BusFlight;
};

