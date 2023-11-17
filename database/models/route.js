'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    static associate(models) {
        Route.belongsToMany(models.language, { through: 'routeattributes' });
        Route.hasMany(models.busflight);
        Route.hasMany(models.routeattributes, { as: 'routeattrs' });
    }
  }

  Route.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
      },
      routePath: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'route',
      tableName: 'routes'
    }
  );

  return Route;
};