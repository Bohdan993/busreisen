const {
    Router
} = require("express");

const router = Router();
const { Op } = require("sequelize");
const City = require("../../models/city");
const CityAttributes = require("../../models/cityAttributes");
const Place = require("../../models/place");
const PlaceAttributes = require("../../models/placeAttributes");
const LanguagesModel = require("../../models/language");
const Currency = require("../../models/currency");
const BusFlightPrices = require("../../models/busFlightPrices");
const BusFlight = require("../../models/busFlight");
const Route = require("../../models/route");
const { isSpecialDate, loadLanguageFile, isValidDate } = require("../../helpers");
const { validateDates } = require("../../middlewares/busFlightMiddlewares");
const { filterBusFlights, transformBusFlights, filterBusFlightsAvailableDates } = require("../../services/busFlightService");
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");


router.get("/", validateDates, async (req, res, next) => {
    try {
        let busFlights = [];
        let cities = [];
        let price = "";
        
        const {
            languageCode = "uk_UA", 
            mode = "html", 
            startDate = null, 
            endDate = null, 
            originId = null, 
            destinationId = null, 
            adults = 1,
            children = 0,
            currencyAbbr = null
        } = req?.query;


        const lang = await LanguagesModel.findOne({
            where: {
                code: {
                    [Op.eq]: languageCode
                }
            }
        });

        const error404Translations = loadLanguageFile("404-error.js", lang?.code);

        let currency = await Currency.findOne({
            attributes: ["id", "name", "abbr", "symbol"],
            where: {
                abbr: {
                    [Op.eq]: currencyAbbr
                }
            }
        });

        currency = currency?.toJSON();

        let query = {
            attributes: ["id", "allSeats", "freeSeats", "routeId", "dateOfDeparture"],
            where:{
                freeSeats: {
                    [Op.gte]: parseInt(adults) + parseInt(children)
                },
                dateOfDeparture: {
                    [Op.or]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Route
                }
            ],
            order: [
                ["dateOfDeparture", "ASC"],
                ["routeId", "ASC"],
            ]
        };

        if(isSpecialDate(endDate)) {
            query.where.dateOfDeparture = {};
            query.where.dateOfDeparture = isValidDate(new Date(startDate)) ? startDate : null;
        } else {
            query.where.dateOfDeparture = {};
            query.where.dateOfDeparture[Op.or] = [isValidDate(new Date(startDate)) ? startDate : null, isValidDate(new Date(endDate)) ? endDate : null];
        }
    
        busFlights = await BusFlight.findAll(query);

        if(!busFlights?.length) {
            return res.status(404).render("error-404", {translations: error404Translations});
        }

        busFlights = busFlights?.map(bf => bf?.toJSON());
        const filteredBusFlights = filterBusFlights({busFlights, originId, destinationId, startDate, endDate});

        if(!filteredBusFlights?.resultFrom?.length) {
            return res.status(404).render("error-404", {translations: error404Translations});
        }

        let placeIds = [...filteredBusFlights?.resultFrom.map(el => el?.route?.routePath?.onboarding.map(item => item?.placeId)), ...filteredBusFlights?.resultFrom.map(el => el?.route?.routePath?.outboarding.map(item => item?.placeId))];

        let cityQuery = {
            attributes: ["id"],
            where:{
                id: {
                    [Op.or]: [originId, destinationId]
                }
            },
            include: [
                {
                    model: CityAttributes,
                    attributes: ["name", "cityId", "languageId"],
                    where: {
                        languageId: {
                            [Op.eq]: lang?.id
                        }
                    }
                },
                {
                    model: Place,
                    attributes: ["id"],
                    include: [
                        {
                            model: PlaceAttributes,
                            attributes: ["name", "placeId", "languageId"],
                            where: {
                                languageId: {
                                    [Op.eq]: lang?.id
                                },
                                placeId: {
                                    [Op.or]: Array.from(new Set(placeIds))
                                }
                            }
                        }
                    ]
                }
            ]
        }

        cities = await City.findAll(cityQuery);

        if(!cities?.length || cities?.length !== 2) {
            return res.status(404).render("error-404", {translations: error404Translations});
        }

        cities = cities?.map(city => city?.toJSON());

        let priceQuery = {
            attributes: ["currencyId", "firstCityId", "secondCityId", "priceOneWay", "priceRoundTrip"],
            where: {
                [Op.and]: [
                    { firstCityId: originId },
                    { secondCityId: destinationId },
                    { currencyId: currency?.id },
                  ]
            }
        }

        price = await BusFlightPrices.findOne(priceQuery);
        price = price?.toJSON();
        
        const transformedBusFlights = transformBusFlights({busFlights: filteredBusFlights, cities, price, currency, originId, destinationId, endDate, startDate, languageCode: lang?.code});

        
        req.session.regenerate(function (err) {
            if (err) next(err);

            req.session.busFlights = transformedBusFlights;
            req.session.language = lang?.code;
            req.session.startDate = startDate;
            req.session.endDate = endDate;
            req.session.currencyAbbr = currency?.abbr;
            req.session.currencySymbol = currency?.symbol;
            req.session.adults = adults;
            req.session.children = children;
            req.session.originId = originId;
            req.session.destinationId = destinationId;

            req.session.isStarted = true;

            req.session.save(function (err) {
                if (err) return next(err);

                if(mode?.toLowerCase() === "json") {
                    return res.json({status: "ok", data: transformedBusFlights});
                }
        
                if(mode?.toLowerCase() === "html" || !mode) {
                    return res.render("ticket-list", { flightsData: transformedBusFlights, translations: loadLanguageFile("ticket-list.js", lang?.code)});
                }
            });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.get("/available-dates", async(req, res) => {
    try{
        const {
            originId = null, 
            destinationId = null
        } = req?.query;

        let busFlights;

        let query = {
            attributes: ["id", "allSeats", "freeSeats", "routeId", "dateOfDeparture"],
            where:{
                freeSeats: {
                    [Op.gte]: 1
                },
                dateOfDeparture: {
                    [Op.gte]: new Date()
                }
            },
            include: [
                {
                    model: Route
                }
            ],
            order: [
                ["dateOfDeparture", "ASC"],
                ["routeId", "ASC"],
            ]
        };
    
        busFlights = await BusFlight.findAll(query);
        busFlights = busFlights?.map(bf => bf?.toJSON());

        busFlights = filterBusFlightsAvailableDates(busFlights, originId, destinationId);
        
        return res.json({status: "ok", data: busFlights});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
});

router.post("/select", checkIfSessionIsStarted, async(req, res, next) => {
    try{
        const {
            id
        } = req?.body;

        const selectedBusFlight = req.session?.busFlights?.find(el => {return String(el?.id) === String(id)});

        if(!selectedBusFlight) {
            throw new Error();
        }

        req.session.selectedBusFlight = selectedBusFlight;
        req.session.busFlights = null;
        
        req.session.save(function (err) {
            if (err) next(err);

            return res.json({status: "ok"});
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
})


module.exports = router