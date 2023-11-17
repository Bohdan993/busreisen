const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const DiscountsModel = require("./discount");


const DiscountAttributes = sequelize.define("DiscountAttributes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {type: DataTypes.STRING, allowNull: false},
    discountId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        references: {
            model: DiscountsModel, 
            key: "id",
        }
    },
    languageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

