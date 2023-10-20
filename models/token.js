const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const UsersModel = require("./user");

const Token = sequelize.define("token", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING, allowNull: false},
    deviceFingerprint: {type: DataTypes.STRING, allowNull: false}
});

UsersModel.hasMany(Token);
Token.belongsTo(UsersModel);

module.exports = Token;

