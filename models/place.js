const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const CitiesModel = require("./city");

const Place = sequelize.define("place", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    cityId: {type: DataTypes.INTEGER, allowNull: false},
});

CitiesModel.hasMany(Place);
Place.belongsTo(CitiesModel);



module.exports = Place;

