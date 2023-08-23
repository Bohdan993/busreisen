const {
    Router
} = require("express");
const router = Router();
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const { encodeHTMLEntities, decodeHTMLEntities } = require("../../helpers");


router.get("/", checkIfSessionIsStarted, async (req, res) => {
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
            currencySymbol
        } = req?.session;

        const data = { 
            adults, 
            children, 
            price: purePrice, 
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