const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Passanager = sequelize.define("passanger", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING(30), allowNull: false},
    lastName: {type: DataTypes.STRING(30), allowNull: true},
    phone: {type: DataTypes.STRING(14), unique: true, allowNull: false},
    additionalPhone:{type: DataTypes.STRING(14), allowNull: true},
    dateOfBirth: {type: DataTypes.DATEONLY, allowNull: true},
    email: {type: DataTypes.STRING, unique: true, validate: {isEmail: true}, allowNull: true}
});

module.exports = Passanager;

