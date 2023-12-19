const {
    Router
} = require("express");
const pug = require("pug");
const path = require("path");
const {v4: uuidv4} = require("uuid");
const fetch = require("node-fetch");
const { strToSign, calculatePrice } = require("../../services/paymentService");
const { loadLanguageFile, getTicketSubject} = require("../../helpers");
const { checkIfSessionIsStarted} = require("../../middlewares/sessionMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const { checkIfPassengersInfoExists } = require("../../middlewares/passengersMiddleware");
const constants = require("../../helpers/constants");

const router = Router();

router.post("/", [checkIfSessionIsStarted, checkIfBusFlightSelected, checkIfPassengersInfoExists], async (req, res, next) => {
    try {

        const {
            languageCode = "uk_UA"
        } = req?.query;

        const {
            currency,
            passengersInfo,
            selectedBusFlight,
            email
        } = req.session;

        const currenciesExchangeUrl = "https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11";
        const price = await calculatePrice({data: passengersInfo});

        if(String(currency?.abbr) !== "UAH") {
            const currenciesExchangeResponse = await fetch(currenciesExchangeUrl);
            const currenciesExchangeData = await currenciesExchangeResponse.json();
            const currencyExchangeObj = currenciesExchangeData?.find(el => String(el?.ccy) === String(currency?.abbr));
            ticketPrice = Math.round(Number(price) * Number(currencyExchangeObj?.sale));
        } else {
            ticketPrice = price;
        }
        const passengersInfoData = Object.entries(passengersInfo);
        const firstPassaneger = passengersInfoData[0][1];
        const firstPassanegerPhoneNum = firstPassaneger[`phone-1`];
        const firstPassanegerName = firstPassaneger[`name-1`];
        const firstPassanegerLastName = firstPassaneger[`last-name-1`];

        const params =  {
            "public_key"     : process.env.LIQPAY_PUBLIC_KEY,
            "action"         : "pay",
            "amount"         : ticketPrice,
            "currency"       : "UAH",
            "description"    : "Оплата за " +  getTicketSubject(selectedBusFlight, languageCode),
            "order_id"       : uuidv4(),
            "version"        : "3",
            "paytypes"       : "card, liqpay, qr",
            "language"       : languageCode === "de_DE" ? "en" : languageCode.split("_")[0],
            "info"           : JSON.stringify({"originalCurrency": currency?.abbr, "originalPrice": price}),
            "sender_first_name": `(${firstPassanegerPhoneNum}) ${firstPassanegerName}`,
            "sender_last_name": `(${email}) ${firstPassanegerLastName}`
        };

        const data = Buffer.from(JSON.stringify(params))
                    .toString("base64");
        const signature = strToSign(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY);
        req.session.flag = !req.session.flag;
        return req.session.save(function (err) {
            if (err) return next(err);

            const template = path.resolve("views", "payment-widget.pug");
            const html = pug.renderFile(template, { 
                data, 
                signature, 
                translations: loadLanguageFile("payment-widget.js", languageCode),
                language: languageCode === "de_DE" ? "en" : languageCode.split("_")[0],
                linkToMain: languageCode === "ru_RU" ? "/" : languageCode === "uk_UA" ? "/ua" : languageCode.split("_")[0],
            });

            return res.json({
                status: "ok",
                data: html,
                sessionExpiresTime: constants.SESSION_TIME
            });
            // return res.render("payment-widget", 
            //     { 
            //         data, 
            //         signature, 
            //         translations: loadLanguageFile("payment-widget.js", languageCode),
            //         language: languageCode === "de_DE" ? "en" : languageCode.split("_")[0],
            //         linkToMain: languageCode === "ru_RU" ? "/" : languageCode === "uk_UA" ? "/ua" : languageCode.split("_")[0],
            //     }
            // );
        });
        

    } catch (err) {
        return next(err);
    }
    
});

module.exports = router