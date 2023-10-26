const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const BusFlightModel = require('./busFlight');

const Discount = sequelize.define("discount", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    coef: {type: DataTypes.FLOAT(3, 2),  allowNull: false},
    inactivePeriod: {type: DataTypes.STRING(11), allowNull: true, defaultValue: null},
    order: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 500 }
});

BusFlightModel.hasOne(Discount);
Discount.belongsTo(BusFlightModel);

module.exports = Discount;

