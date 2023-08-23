const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const City = require("./city");

const CityAttributes = sequelize.define("CityAttributes", {
    name: {type: DataTypes.STRING(30), allowNull: false},
    cityId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        primaryKey: true,
        references: {
            model: City, 
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


LanguagesModel.belongsToMany(City, { through: CityAttributes });
City.belongsToMany(LanguagesModel, { through: CityAttributes });

LanguagesModel.hasMany(CityAttributes);
CityAttributes.belongsTo(LanguagesModel);
City.hasMany(CityAttributes);
CityAttributes.belongsTo(City);


module.exports = CityAttributes;

