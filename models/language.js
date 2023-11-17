const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Language = sequelize.define("language", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING(20), allowNull: false, unique: true},
    code: {type: DataTypes.STRING(8), allowNull: false, unique: true}
});

module.exports = Language;

