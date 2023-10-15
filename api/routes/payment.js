const {
    Router
} = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require('fs');
const {v4: uuidv4} = require("uuid");
const { strToSign, calculatePrice } = require("../../services/paymentService");
const { loadLanguageFile, transformTimestampToDate } = require("../../helpers");
const { checkCallbackSignature } = require("../../middlewares/paymentMiddlewares");
const { generatePDFTicket, generateHTMLTicket } = require("../../services/ticketService");
const { checkIfSessionIsStarted, checkIfSessionIsFinished } = require("../../middlewares/sessionMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const { sendFileMail } = require("../../services/mailService");
const TicketsModel = require("../../models/ticket");
const { Op } = require("sequelize");
const constants = require("../../helpers/constants");
const router = Router();


router.post("/", [checkIfSessionIsStarted, checkIfBusFlightSelected, checkIfSessionIsFinished], async (req, res) => {
    try {

        const {
            languageCode = "uk_UA"
        } = req?.query;

        const {
            currency,
            originId,
            destinationId,
            startDate,
            endDate,
            selectedBusFlight,
            passangersInfo,
            email
        } = req.session;

        const { cities, places, dates, busFlightToId, busFlightFromId } = selectedBusFlight;
        const price = await calculatePrice({data: passangersInfo});
        const params =  {
            "public_key"     : process.env.LIQPAY_PUBLIC_KEY,
            "action"         : "pay",
            "amount"         : price,
            "currency"       : currency?.abbr,
            "description"    : "Оплата за квиток",
            "order_id"       : uuidv4(),
            "version"        : "3",
            "paytypes"       : "card, liqpay, qr",
            "language"       : languageCode === "de_DE" ? "en" : languageCode.split("_")[0],
            "info"           : JSON.stringify({
                                passangersInfo, 
                                cities, 
                                places, 
                                dates, 
                                startDate, 
                                endDate, 
                                destinationId, 
                                originId, 
                                email, 
                                languageCode, 
                                busFlightFromId, 
                                busFlightToId
                            }),
            "server_url"     : process.env.LIQPAY_CALLBACK_URL
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
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.post("/liqpay-callback", checkCallbackSignature, async (req, res) => {
    console.log("LIQPAY CALLBACK");
    try {

        const {
            data,
            signature
        } = req?.body;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");
        const { currency: currencyAbbr, amount: price, info} = JSON.parse(decodedData);
        const { passangersInfo, cities, places, dates, email, languageCode} = JSON.parse(info);
        const passangersInfoData = Object.entries(passangersInfo);
        const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
        const pdfName = pdfHash + ".pdf";
        const pdfPath = path.resolve("assets", "tickets", pdfName);

        let ticket = await TicketsModel.findOne({
            where: {
                signature: {
                    [Op.eq]: signature
                }
            }
        });


        ticket = ticket?.toJSON();
        ticket.createdAt = ticket.createdAt.toISOString();

        const promise = new Promise((res, rej) => {
            fs.readFile(pdfPath, async function (err, fileData) {

                try {
                    if (err) {

                        const html = await generateHTMLTicket({
                            languageCode,
                            cities,
                            signature,
                            price,
                            currencyAbbr,
                            passangersInfoData,
                            dates,
                            places,
                            ticket,
                            constants,
                            template: "full-ticket.pug",
                            transformTimestampToDate
                        });

                        const { pdfPath } = await generatePDFTicket(signature, html);
                        await sendFileMail(email, pdfPath, languageCode);
                        return res();
                        
                    }
                    
                    await sendFileMail(email, pdfPath, languageCode);
                    return res();
                } catch(err) {
                    return rej(err);
                }
            });
        });

        await promise;

        return res.json({status: "ok"});

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


module.exports = router