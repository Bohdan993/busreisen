const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const TicketsModel = require("./ticket");
const PassangersModel = require("./passanger");
const DiscountsModel = require("./discount");

const PassangerTicket = sequelize.define("PassangerTicket", {
    passangerDiscountId: {
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
    passangerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: PassangersModel, 
            key: "id",
        }
    }

});


PassangersModel.belongsToMany(TicketsModel, { through: PassangerTicket });
TicketsModel.belongsToMany(PassangersModel, { through: PassangerTicket });

module.exports = PassangerTicket;

