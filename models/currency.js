const { DataTypes } = require("sequelize");
const sequelize = require("../db");
// const CitiesModel = require("./city");

const Currency = sequelize.define("currency", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING(20), allowNull: false},
    abbr: {type: DataTypes.STRING(4), allowNull: false, unique: true},
    symbol: {type: DataTypes.STRING(3), allowNull: false, unique: true},
    isBaseCurrency: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    coef: {type: DataTypes.FLOAT(8, 4),  allowNull: false, defaultValue: 1.0000},
});

// CitiesModel.hasMany(Currency);
// Currency.belongsTo(CitiesModel);



module.exports = Currency;

