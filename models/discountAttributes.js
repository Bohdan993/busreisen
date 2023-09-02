const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const DiscountsModel = require("./discount");
const constants = require("../helpers/constants");

const DiscountAttributes = sequelize.define("DiscountAttributes", {
    name: {type: DataTypes.STRING, allowNull: false},
    group: { type: DataTypes.ENUM, values: [constants.ADULTS, constants.CHILDREN, constants.BOTH, constants.BUS_FLIGHT], defaultValue: constants.ADULTS, allowNull: false},
    discountId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        primaryKey: true,
        references: {
            model: DiscountsModel, 
            key: "id",
        }
    },
    languageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: LanguagesModel, 
            key: "id",
        }
    }
});

LanguagesModel.belongsToMany(DiscountsModel, { through: DiscountAttributes });
DiscountsModel.belongsToMany(LanguagesModel, { through: DiscountAttributes });

LanguagesModel.hasMany(DiscountAttributes);
DiscountAttributes.belongsTo(LanguagesModel);
DiscountsModel.hasMany(DiscountAttributes);
DiscountAttributes.belongsTo(DiscountsModel);


module.exports = DiscountAttributes;

