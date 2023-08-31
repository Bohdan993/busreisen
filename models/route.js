const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Route = sequelize.define("route", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    routePath: {
        type: DataTypes.TEXT, 
        allowNull: false,
        get: function () {
            return JSON.parse(this.getDataValue("routePath"));
        },
        set: function (value) {
            this.setDataValue("routePath", JSON.stringify(value));
        },
    }
});

module.exports = Route;

