const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const CountriesModel = require("./country");;

const City = sequelize.define("city", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    countryId: {type: DataTypes.INTEGER, allowNull: false},
});

CountriesModel.hasMany(City);
City.belongsTo(CountriesModel);



module.exports = City;

