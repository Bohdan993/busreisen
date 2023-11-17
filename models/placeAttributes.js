const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const PlacesModel = require("./place");

const PlaceAttributes = sequelize.define("PlaceAttributes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {type: DataTypes.STRING, allowNull: false},
    placeId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        // primaryKey: true,
        references: {
            model: PlacesModel, 
            key: "id",
        }
    },
    languageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // primaryKey: true,
        references: {
            model: LanguagesModel, 
            key: "id",
        }
    }
});

LanguagesModel.belongsToMany(PlacesModel, { through: PlaceAttributes });
PlacesModel.belongsToMany(LanguagesModel, { through: PlaceAttributes });

LanguagesModel.hasMany(PlaceAttributes);
PlaceAttributes.belongsTo(LanguagesModel);
PlacesModel.hasMany(PlaceAttributes);
PlaceAttributes.belongsTo(PlacesModel);


module.exports = PlaceAttributes;

