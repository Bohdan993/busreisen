const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const RoutesModel = require("./route");

const BusFlight = sequelize.define("busflight", {
    id: {type: DataTypes.INTEGER, unique: true, autoIncrement: true, primaryKey: true},
    allSeats: { type: DataTypes.INTEGER, allowNull: false },
    freeSeats: { type: DataTypes.INTEGER, allowNull: false },
    routeId: {        
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RoutesModel,
            key: "id",
        }
    },
    dateOfDeparture: {type: DataTypes.DATEONLY, allowNull: false, validate: {isDate: true}}
});

RoutesModel.hasMany(BusFlight);
BusFlight.belongsTo(RoutesModel);


module.exports = BusFlight;

