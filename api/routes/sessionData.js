const {
    Router
} = require("express");
const router = Router();
const { checkIfSessionIsStarted} = require("../../middlewares/sessionMiddlewares");
const { encodeHTMLEntities, decodeHTMLEntities} = require("../../helpers");
const { calculatePrice } = require("../../services/paymentService");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const constants = require("../../helpers/constants");

router.get("/", [checkIfSessionIsStarted, checkIfBusFlightSelected], async (req, res, next) => {
    try {

        const {
            adults,
            children,
            selectedBusFlight: {
                purePrice
            },
            startDate, 
            endDate,
            bookingPageParams,
            currency: {
                symbol: currencySymbol
            },
            passengersInfo, 
        } = req?.session;

        let price = await calculatePrice({data: passengersInfo}) || Math.round(parseInt(purePrice) * (parseInt(adults) + parseInt(children)));

        const data = { 
            adults, 
            children, 
            price, 
            startDate, 
            endDate, 
            bookingPageParams, 
            currencySymbol 
        };

        for(const key in data) {
            if(typeof data[key] === "string") {
                data[key] = decodeHTMLEntities(data[key]);
            }
        }

        req.session.flag = !req.session.flag;
        return req.session.save(function (err) {
            if (err) return next(err);

            return res.json({
                status: "ok", 
                data,
                sessionExpiresTime: constants.SESSION_TIME
            });
        });

    } catch (err) {
        return next(err);
    }
    
});

router.post("/", [checkIfSessionIsStarted], async (req, res, next) => {
    try {

        for(const key in req?.body) {
            req.session[key] = encodeHTMLEntities(req.body[key]);
        }

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

router.get("/is-started", [checkIfSessionIsStarted], async (req, res, next) => {
    try {
        return res.json({status: "ok", active: req?.session?.isStarted});

    } catch (err) {
        return next(err);
    }
})

module.exports = router