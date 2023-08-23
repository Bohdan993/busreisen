const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const UsersModel = require("./user");
const CitiesModel = require("./city");
const constants = require("../helpers/constants");

const Ticket = sequelize.define("ticket", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    dateOfDeparture: {type: DataTypes.DATEONLY, allowNull: false, validate: {isDate: true}},
    dateOfReturn: {type: DataTypes.DATEONLY, allowNull: true, validate: {isDate: true}},
    price: { type: DataTypes.INTEGER, allowNull: false },
    currencyAbbr: {type: DataTypes.STRING(4), allowNull: false},
    type: { type: DataTypes.ENUM, values: [constants.ONE_WAY, constants.ROUND, constants.OPEN_DATE]},
    signature: { type: DataTypes.STRING, allowNull: false, unique: true},
    originId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CitiesModel, 
            key: "id",
        }
    },
    destinationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CitiesModel,
            key: "id",
        }
    },
    children: {
        type: DataTypes.TEXT, 
        allowNull: true,
        get: function () {
            return JSON.parse(this.getDataValue(constants.CHILDREN));
        },
        set: function (value) {
            this.setDataValue(constants.CHILDREN, JSON.stringify(value));
        }
    }
});

UsersModel.belongsToMany(Ticket, { through: "UserTicket" });
Ticket.belongsToMany(UsersModel, { through: "UserTicket" });

module.exports = Ticket;
