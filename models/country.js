const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Country = sequelize.define("country", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
});

module.exports = Country;

