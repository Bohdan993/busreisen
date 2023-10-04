const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const CitiesModel = require("./busFlight");
const CurrenciesModel = require("./currency");

const BusFlightPrices = sequelize.define("BusFlightPrices", {
    priceOneWay: { type: DataTypes.INTEGER, allowNull: false },
    priceRoundTrip: { type: DataTypes.INTEGER, allowNull: false },
    firstCityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: CitiesModel, 
            key: "id",
        }
    },
    secondCityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: CitiesModel, 
            key: "id",
        }
    },
    currencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: CurrenciesModel, 
            key: "id",
        }
    }
});


CitiesModel.hasMany(BusFlightPrices, { as: "FirstBusFlightCity", foreignKey: "firstCityId" });
CitiesModel.hasMany(BusFlightPrices, { as: "SecondBusFlightCity", foreignKey: "secondCityId" });
BusFlightPrices.belongsTo(CitiesModel, { foreignKey: "firstCityId" });
BusFlightPrices.belongsTo(CitiesModel, { foreignKey: "secondCityId"});

CurrenciesModel.hasMany(BusFlightPrices);
BusFlightPrices.belongsTo(CurrenciesModel);



module.exports = BusFlightPrices;

