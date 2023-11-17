const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const CitiesModel = require("./city");
const BusFlightModel = require("./busFlight");
const constants = require("../helpers/constants");

const Ticket = sequelize.define("ticket", {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    dateOfDeparture: {type: DataTypes.DATEONLY, allowNull: false, validate: {isDate: true}},
    dateOfReturn: {type: DataTypes.DATEONLY, allowNull: true, validate: {isDate: true}},
    busFlightFromId: {type: DataTypes.INTEGER, allowNull: false, 
        references: {
            model: BusFlightModel,
            key: "id",
        }
    },
    busFlightToId: {type: DataTypes.INTEGER, allowNull: true,
        references: {
            model: BusFlightModel,
            key: "id",
        }
    },
    price: { type: DataTypes.INTEGER, allowNull: false },
    currencyAbbr: {type: DataTypes.STRING(4), allowNull: false},
    type: { type: DataTypes.ENUM, values: [constants.ONE_WAY, constants.ROUND, constants.OPEN_DATE]},
    signature: { type: DataTypes.STRING, allowNull: false, unique: true},
    uuid: {  type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    status: { type: DataTypes.ENUM, values: [constants.TICKET_STATUS_NOT_PAYED, constants.TICKET_STATUS_PAYED, constants.TICKET_STATUS_HALF_USED, constants.TICKET_STATUS_USED], defaultValue: constants.TICKET_STATUS_NOT_PAYED, allowNull: false},
    dateOfFirstUsage: {type: DataTypes.DATEONLY, allowNull: true, validate: {isDate: true}},
    hasDiscount: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    discountPercentage: {type: DataTypes.FLOAT(3, 1), allowNull: false},
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
        type: DataTypes.JSON, 
        allowNull: true,
        // get: function () {
        //     return JSON.parse(this.getDataValue(constants.CHILDREN));
        // },
        // set: function (value) {
        //     this.setDataValue(constants.CHILDREN, JSON.stringify(value));
        // }
    }
});

BusFlightModel.hasMany(Ticket, {
    foreignKey: "busFlightFromId"
});
Ticket.belongsTo(BusFlightModel, {
    foreignKey: "busFlightFromId"
});

BusFlightModel.hasMany(Ticket, {
    foreignKey: "busFlightToId"
});
Ticket.belongsTo(BusFlightModel, {
    foreignKey: "busFlightToId"
});

module.exports = Ticket;
