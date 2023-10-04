const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const CityModel = require("./city");

const CityAttributes = sequelize.define("CityAttributes", {
    name: {type: DataTypes.STRING(30), allowNull: false},
    cityId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        primaryKey: true,
        references: {
            model: CityModel, 
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


LanguagesModel.belongsToMany(CityModel, { through: CityAttributes });
CityModel.belongsToMany(LanguagesModel, { through: CityAttributes });

LanguagesModel.hasMany(CityAttributes);
CityAttributes.belongsTo(LanguagesModel);
CityModel.hasMany(CityAttributes);
CityAttributes.belongsTo(CityModel);


module.exports = CityAttributes;

