const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("user", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING(30), allowNull: false},
    lastName: {type: DataTypes.STRING(30), allowNull: true},
    phone: {type: DataTypes.STRING(14), unique: true, allowNull: true},
    additionalPhone:{type: DataTypes.STRING(14), allowNull: true},
    dateOfBirth: {type: DataTypes.DATEONLY, allowNull: true},
    email: {type: DataTypes.STRING, unique: true, validate: {isEmail: true}, allowNull: true},
    password: { type: DataTypes.STRING, allowNull: true, defaultValue: null},
    role: { type: DataTypes.ENUM, values: ["admin", "manager", "user"], defaultValue: "user", allowNull: false},
    isActivated: {type: DataTypes.BOOLEAN, default: false, allowNull: true},
    activationLink: {type: DataTypes.STRING, allowNull: true}
});

module.exports = User;

