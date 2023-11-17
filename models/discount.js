const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const BusFlightModel = require('./busFlight');
const constants = require("../helpers/constants");

const Discount = sequelize.define("discount", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    coef: {type: DataTypes.FLOAT(3, 2),  allowNull: false},
    group: { 
        type: DataTypes.ENUM, 
        values: [constants.ADULTS, constants.CHILDREN, constants.BOTH, constants.BUS_FLIGHT, constants.DISCOUNT_CARD], 
        defaultValue: constants.ADULTS, allowNull: false
    },
    inactivePeriod: {type: DataTypes.STRING(11), allowNull: true, defaultValue: null},
    maxAge: {type: DataTypes.INTEGER, allowNull: true},
    minAge: {type: DataTypes.INTEGER, allowNull: true},
    order: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 500 }
});

BusFlightModel.hasOne(Discount);
Discount.belongsTo(BusFlightModel);

module.exports = Discount;

