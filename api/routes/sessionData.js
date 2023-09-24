const {
    Router
} = require("express");
const router = Router();
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const { encodeHTMLEntities, decodeHTMLEntities, isOneWay } = require("../../helpers");
const { calculatePrice } = require("../../services/paymentService");

router.get("/", checkIfSessionIsStarted, async (req, res) => {
    try {

        const {
            type = "standart"
        } = req?.query;

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
            currency,
            originId,
            destinationId
        } = req?.session;

        let price;

        if(type === "check") {
            const isOneWay1 = isOneWay(endDate);
            price = await calculatePrice({data: passangersInfo, currency, originId, destinationId, isOneWay: isOneWay1});
        }

        if(type === "standart") {
            price = parseInt(purePrice) * (parseInt(adults) + parseInt(children));
        }
        
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
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


router.post("/", checkIfSessionIsStarted, async (req, res, next) => {
    try {

        for(const key in req?.body) {
            req.session[key] = encodeHTMLEntities(req.body[key]);
        }

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