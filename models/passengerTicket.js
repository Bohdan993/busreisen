const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const TicketsModel = require("./ticket");
const PassengersModel = require("./passenger");
const DiscountsModel = require("./discount");

const PassengerTicket = sequelize.define("PassengerTicket", {
    passengerDiscountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: DiscountsModel,
            key: "id"
        }
    },
    discountCardNumber: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    ticketId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        primaryKey: true,
        references: {
            model: TicketsModel, 
            key: "id",
        }
    },
    passengerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: PassengersModel, 
            key: "id",
        }
    }

});


PassengersModel.belongsToMany(TicketsModel, { through: PassengerTicket });
TicketsModel.belongsToMany(PassengersModel, { through: PassengerTicket });

module.exports = PassengerTicket;

