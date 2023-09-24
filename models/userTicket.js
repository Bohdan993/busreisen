const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const TicketsModel = require("./ticket");
const UsersModel = require("./user");
const DiscountsModel = require("./discount");

const UserTicket = sequelize.define("UserTicket", {
    userDiscountId: {
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
            model: UsersModel, 
            key: "id",
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: TicketsModel, 
            key: "id",
        }
    }

});


UsersModel.belongsToMany(TicketsModel, { through: UserTicket });
TicketsModel.belongsToMany(UsersModel, { through: UserTicket });

module.exports = UserTicket;

