const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const constants = require("../helpers/constants");

const User = sequelize.define("user", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    name: {type: DataTypes.STRING(30), allowNull: false},
    phone: {type: DataTypes.STRING(14), unique: true, allowNull: false},
    dateOfBirth: {type: DataTypes.DATEONLY, allowNull: true},
    email: {type: DataTypes.STRING, unique: true, validate: {isEmail: true}, allowNull: true},
    password: { type: DataTypes.STRING, allowNull: true, defaultValue: null},
    role: { type: DataTypes.ENUM, values: [constants.ADMIN_ROLE, constants.MANAGER_ROLE, constants.USER_ROLE], defaultValue: constants.USER_ROLE, allowNull: false},
    isActivated: {type: DataTypes.BOOLEAN, default: false, allowNull: true},
    activationLink: {type: DataTypes.STRING, allowNull: true}
});

module.exports = User;

