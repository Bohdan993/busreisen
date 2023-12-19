const {
    Router
} = require("express");
const router = Router();
const { Op } = require("sequelize");
const pug = require("pug");
const path = require("path");
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
const { checkIfPassengersInfoExists } = require("../../middlewares/passengersMiddleware");
const constants = require("../../helpers/constants");
const APIError = require("../../exeptions/api-error");



router.get("/", [checkIfSessionIsStarted, checkIfBusFlightSelected, checkIfPassengersInfoExists], async (req, res, next) => {

    try {
        let discounts = [];

        const {
            languageCode = "uk_UA",
            mode = "html",
            type = "standart"
        } = req?.query;

        const {
            adults = 1, 
            children = 0,
            selectedBusFlight,
            passengersInfo
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

        req.session.busFlights = null;
        req.session.alternativeBusFlightsFrom = null;
        req.session.alternativeBusFlightsTo = null;
        req.session.flag = !req.session.flag;

        return req.session.save(function (err) {
            if (err) return next(err);
            if(mode?.toLowerCase() === "json") {
                return res.json({
                    status: "ok",
                    data: { adults, children, discounts },
                    sessionExpiresTime: constants.SESSION_TIME
                });
            }

            if(mode?.toLowerCase() === "html" || !mode) {
                const template = path.resolve("views", type === "check" ? "info-check-form.pug" : "passengers-form.pug");
                const html = pug.renderFile(template, { 
                    adults, 
                    children, 
                    discounts,
                    constants, 
                    translations: loadLanguageFile("passengers-form.js", lang?.code),
                    ticketPrice: selectedBusFlight.purePrice,
                    passengersInfo: passengersInfo ? Object.entries(passengersInfo) : null,
                    transformTimestampToDate,
                    showDiscounts: !selectedBusFlight.hasDiscount
                });

                return res.json({
                    status: "ok",
                    data: html,
                    sessionExpiresTime: constants.SESSION_TIME
                });
            }

        });

    } catch (err) {
        return next(err);
    }
    
});

router.post("/validate", [checkIfSessionIsStarted, checkIfBusFlightSelected], async (req, res, next) => {
    try {

        const {
            languageCode = "uk_UA"
        } = req?.query;

        const {
            passengersData
        } = req?.body;

        const {
            startDate,
            selectedBusFlight
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

        const ticketPrice = selectedBusFlight.purePrice;
        const transformedPassengersData = await transformPassengersData(validData.data, ticketPrice, lang?.id);

        req.session.passengersInfo = transformedPassengersData;
        req.session.email = Object.values(transformedPassengersData).find((_, ind) => ind === 0)?.["email-1"];
        req.session.flag = !req.session.flag;
        return req.session.save(function (err) {
            if (err) return next(err);

            return res.json({
                status: "ok",
                sessionExpiresTime: constants.SESSION_TIME
            });
        });

    } catch (err) {
        return next(err);
    }
    
});


module.exports = router