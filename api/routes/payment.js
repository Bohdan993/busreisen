const {
    Router
} = require("express");
const {v4: uuidv4} = require("uuid");
const fetch = require("node-fetch");
const { strToSign, calculatePrice } = require("../../services/paymentService");
const { loadLanguageFile} = require("../../helpers");
const { checkIfSessionIsStarted} = require("../../middlewares/sessionMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const router = Router();

router.post("/", [checkIfSessionIsStarted, checkIfBusFlightSelected], async (req, res, next) => {
    try {

        const {
            languageCode = "uk_UA"
        } = req?.query;

        const {
            currency,
            passengersInfo
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


        const params =  {
            "public_key"     : process.env.LIQPAY_PUBLIC_KEY,
            "action"         : "pay",
            "amount"         : ticketPrice,
            "currency"       : "UAH",
            "description"    : "Оплата за квиток",
            "order_id"       : uuidv4(),
            "version"        : "3",
            "paytypes"       : "card, liqpay, qr",
            "language"       : languageCode === "de_DE" ? "en" : languageCode.split("_")[0],
            "info"           : JSON.stringify({"originalCurrency": currency?.abbr, "originalPrice": price})
        };

        const data = Buffer.from(JSON.stringify(params))
                    .toString("base64");
        const signature = strToSign(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY);
        
        return res.render("payment-widget", 
            { 
                data, 
                signature, 
                translations: loadLanguageFile("payment-widget.js", languageCode),
                language: languageCode === "de_DE" ? "en" : languageCode.split("_")[0],
                linkToMain: languageCode === "ru_RU" ? "/" : languageCode === "uk_UA" ? "/ua" : languageCode.split("_")[0],
            }
        );

    } catch (err) {
        return next(err);
    }
    
});

// router.post("/liqpay-callback", checkCallbackSignature, async (req, res, next) => {
//     try {

//         const {
//             data,
//             signature
//         } = req?.body;

//         const decodedData = Buffer.from(data, "base64").toString("utf-8");
//         const { currency: currencyAbbr, amount: price, info} = JSON.parse(decodedData);
//         const { passengersInfo, cities, places, dates, email, languageCode} = JSON.parse(info);
//         const passengersInfoData = Object.entries(passengersInfo);
//         const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
//         const pdfName = pdfHash + ".pdf";
//         const pdfPath = path.resolve("assets", "tickets", pdfName);

//         let ticket = await TicketsModel.findOne({
//             where: {
//                 signature: {
//                     [Op.eq]: signature
//                 }
//             }
//         });


//         ticket = ticket?.toJSON();
//         ticket.createdAt = ticket.createdAt.toISOString();

//         const promise = new Promise((res, rej) => {
//             fs.readFile(pdfPath, async function (err, fileData) {

//                 try {
//                     if (err) {

//                         const html = await generateHTMLTicket({
//                             languageCode,
//                             cities,
//                             signature,
//                             price,
//                             currencyAbbr,
//                             passengersInfoData,
//                             dates,
//                             places,
//                             ticket,
//                             constants,
//                             template: "full-ticket.pug",
//                             transformTimestampToDate
//                         });

//                         const { pdfPath } = await generatePDFTicket(signature, html);
//                         await sendFileMail(email, pdfPath, languageCode);
//                         return res();
                        
//                     }
                    
//                     await sendFileMail(email, pdfPath, languageCode);
//                     return res();
//                 } catch(err) {
//                     return rej(err);
//                 }
//             });
//         });

//         await promise;

//         return res.json({status: "ok"});

//     } catch (err) {
//         return next(err);
//     }
    
// });


module.exports = router