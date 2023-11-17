const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const CountriesModel = require("./country");
const CurrencyModel = require("./currency");

const City = sequelize.define("city", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    countryId: {type: DataTypes.INTEGER, allowNull: false},
    currencyId: {type: DataTypes.INTEGER, allowNull: false}
});

CountriesModel.hasMany(City);
City.belongsTo(CountriesModel);

CurrencyModel.hasMany(City);
City.belongsTo(CurrencyModel);



module.exports = City;

