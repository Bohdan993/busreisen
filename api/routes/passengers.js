const {
    Router
} = require("express");
const router = Router();
const { Op } = require("sequelize");
const { 
    language: Language,
    discount: Discount,
    discountattributes: DiscountAttributes
  } = require("../../database/models/index");
const { loadLanguageFile, transformTimestampToDate } = require("../../helpers");
const { mapDiscounts, filterByDateDiscounts } = require("../../services/discountService");
const { validatePassengersData, transformPassengersData } = require("../../services/passengerService");
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const constants = require("../../helpers/constants");
const APIError = require("../../exeptions/api-error");

router.get("/", [checkIfSessionIsStarted, checkIfBusFlightSelected], async (req, res, next) => {

    try {
        let discounts = [];

        const {
            languageCode = "uk_UA",
            mode = "html",
            type = "standart"
        } = req?.query;

        const {
            adults = 1, 
            children = 0
        } = req.session;

        const lang = await Language.findOne({
            where: {
                code: {
                    [Op.eq]: languageCode
                }
            }
        });

        discounts = await Discount.findAll({
            attributes: ["id", "coef", "inactivePeriod", "group", "maxAge", "minAge"],
            where: {
                group: {
                    [Op.not]: constants.BUS_FLIGHT
                }
            },
            include: [
                {
                    model: Language,
                    where: {
                        id: {
                            [Op.eq]: lang?.id
                        }
                    },
                    attributes: ["name", "code"],
                    through: {
                        attributes: []
                    }
                },
                {
                    model: DiscountAttributes,
                    as: "discountattrs",
                    attributes: ["name", /* "group",*/ "languageId"],
                    where: {
                        languageId: {
                            [Op.eq]: lang?.id
                        }
                    }
                }
            ],
            order: [
                ["order", "ASC"]
            ]

        });

        discounts = discounts?.map(discount => discount?.toJSON());
        discounts = mapDiscounts(discounts);
        discounts = filterByDateDiscounts(discounts);

        if(mode?.toLowerCase() === "html" || !mode) {
            return res.render(type === "check" ? "info-check-form" : "passengers-form", 
                { 
                    adults, 
                    children, 
                    discounts,
                    constants, 
                    translations: loadLanguageFile("passengers-form.js", lang?.code),
                    ticketPrice: req.session.selectedBusFlight.purePrice,
                    passengersInfo: req.session?.passengersInfo ? Object.entries(req.session?.passengersInfo) : null,
                    transformTimestampToDate,
                    showDiscounts: !req.session.selectedBusFlight.hasDiscount
                }
            );
        }

        req.session.busFlights = null;
        req.session.alternativeBusFlightsFrom = null;
        req.session.alternativeBusFlightsTo = null;
        req.session.save(function (err) {
            if (err) return next(err);
            return res.json({status: "ok", data: { adults, children, discounts }});
        });

    } catch (err) {
        return next(err);
    }
    
});

router.post("/validate", [checkIfSessionIsStarted, checkIfBusFlightSelected/*, checkIfSessionIsFinished*/], async (req, res, next) => {
    try {

        const {
            languageCode = "uk_UA"
        } = req?.query;

        const {
            passengersData
        } = req?.body;

        const {
            startDate
        } = req?.session;

        const lang = await Language.findOne({
            where: {
              code: {
                [Op.eq]: languageCode,
              },
            },
          });
      
        const passengerTranslations = loadLanguageFile("passengers-form.js", lang?.code);
        const validData = await validatePassengersData(passengersData, passengerTranslations, startDate);

        if(validData.status === "error") {
            throw APIError.ValidationError("validation error", validData.data);
        }

        const ticketPrice = req.session.selectedBusFlight.purePrice;
        const transformedPassengersData = await transformPassengersData(validData.data, ticketPrice, lang?.id);

        req.session.passengersInfo = transformedPassengersData;
        req.session.email = Object.values(transformedPassengersData).find((_, ind) => ind === 0)?.["email-1"];

        req.session.save(function (err) {
            if (err) return next(err);

            return res.json({status: "ok"});
        });

    } catch (err) {
        return next(err);
    }
    
});


module.exports = router