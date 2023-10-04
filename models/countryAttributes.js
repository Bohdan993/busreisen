const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const CountriesModel = require("./country");

const CountryAttributes = sequelize.define("CountryAttributes", {
    name: {type: DataTypes.STRING(30), allowNull: false},
    countryId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        primaryKey: true,
        references: {
            model: CountriesModel, 
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

LanguagesModel.belongsToMany(CountriesModel, { through: CountryAttributes });
CountriesModel.belongsToMany(LanguagesModel, { through: CountryAttributes });

LanguagesModel.hasMany(CountryAttributes);
CountryAttributes.belongsTo(LanguagesModel);
CountriesModel.hasMany(CountryAttributes);
CountryAttributes.belongsTo(CountriesModel);



module.exports = CountryAttributes;

