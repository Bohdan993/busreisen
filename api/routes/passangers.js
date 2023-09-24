const {
    Router
} = require("express");
const router = Router();
const DiscountModel = require("../../models/discount");
const DiscountAttributesModel = require("../../models/discountAttributes");
const LanguagesModel = require("../../models/language");
const { Op } = require("sequelize");
const { loadLanguageFile } = require("../../helpers");
const { mapDiscounts, filterByDateDiscounts } = require("../../services/discountService");
const { validatePassangersData } = require("../../services/passangerService");
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const constants = require("../../helpers/constants");



router.get("/", [checkIfSessionIsStarted, checkIfBusFlightSelected], async (req, res) => {
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

        const lang = await LanguagesModel.findOne({
            where: {
                code: {
                    [Op.eq]: languageCode
                }
            }
        });

        discounts = await DiscountModel.findAll({
            attributes: ["id", "coef", "inactivePeriod"],
            include: [
                {
                    model: LanguagesModel,
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
                    model: DiscountAttributesModel,
                    attributes: ["name", "group", "languageId"],
                    where: {
                        languageId: {
                            [Op.eq]: lang?.id
                        },
                        group: {
                            [Op.not]: constants.BUS_FLIGHT
                        }
                    }
                }
            ],

        });

        discounts = discounts?.map(discount => discount?.toJSON());
        discounts = mapDiscounts(discounts);
        discounts = filterByDateDiscounts(discounts);

        if(mode?.toLowerCase() === "html" || !mode) {
            return res.render(type === "check" ? "info-check-form" : "passangers-form", 
                { 
                    adults, 
                    children, 
                    discounts,
                    constants, 
                    translations: loadLanguageFile("passangers-form.js", lang?.code),
                    ticketPrice: req.session.selectedBusFlight.purePrice,
                    passangersInfo: req.session?.passangersInfo ? Object.entries(req.session?.passangersInfo) : null
                }
            );
        }

        return res.json({status: "ok", data: { adults, children, discounts }});

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.post("/validate", [checkIfSessionIsStarted, checkIfBusFlightSelected], async (req, res, next) => {
    try {

        const {
            languageCode = "uk_UA"
        } = req?.query;

        const {
            passangersData
        } = req?.body;


        const lang = await LanguagesModel.findOne({
            where: {
              code: {
                [Op.eq]: languageCode,
              },
            },
          });
      
        const passangerTranslations = loadLanguageFile("passangers-form.js", lang?.code);
        const validData = await validatePassangersData(passangersData, passangerTranslations);

        if(validData.status === "error") {
            return res.status(422).json({status: "validation error", errors: validData.data});
        }

        req.session.passangersInfo = validData.data;
        console.log(req.session.passangersInfo);
        req.session.email = Object.values(validData.data).find((_, ind) => ind === 0)?.["email-1"];

        req.session.save(function (err) {
            if (err) next(err);

            return res.json({status: "ok"});
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


module.exports = router