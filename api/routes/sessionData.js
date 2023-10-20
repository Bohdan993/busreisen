const {
    Router
} = require("express");
const router = Router();
const { checkIfSessionIsStarted/*, checkIfSessionIsFinished */} = require("../../middlewares/sessionMiddlewares");
const { encodeHTMLEntities, decodeHTMLEntities, isOneWay } = require("../../helpers");
const { calculatePrice } = require("../../services/paymentService");


router.get("/", [checkIfSessionIsStarted/*, checkIfSessionIsFinished*/], async (req, res, next) => {
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
            passangersInfo, 
        } = req?.session;

        let price = await calculatePrice({data: passangersInfo}) || Math.round(parseInt(purePrice) * (parseInt(adults) + parseInt(children)));

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
        
        return res.json({status: "ok", data});

    } catch (err) {
        return next(err);
    }
    
});

router.post("/", [checkIfSessionIsStarted/*, checkIfSessionIsFinished*/], async (req, res, next) => {
    try {

        for(const key in req?.body) {
            req.session[key] = encodeHTMLEntities(req.body[key]);
        }

        req.session.save(function (err) {
            if (err) return next(err);

            return res.json({status: "ok"});
        });

    } catch (err) {
        return next(err);
    }
    
});

module.exports = router