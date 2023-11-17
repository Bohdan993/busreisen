const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const LanguagesModel = require("./language");
const RoutesModel = require("./route");

const RouteAttributes = sequelize.define("RouteAttributes", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {type: DataTypes.STRING, allowNull: false},
    routeId: {
        type: DataTypes.INTEGER,         
        allowNull: false,
        // primaryKey: true,
        references: {
            model: RoutesModel, 
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

LanguagesModel.belongsToMany(RoutesModel, { through: RouteAttributes });
RoutesModel.belongsToMany(LanguagesModel, { through: RouteAttributes });

LanguagesModel.hasMany(RouteAttributes);
RouteAttributes.belongsTo(LanguagesModel);
RoutesModel.hasMany(RouteAttributes);
RouteAttributes.belongsTo(RoutesModel);


module.exports = RouteAttributes;

