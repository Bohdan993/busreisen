const {
    Router
} = require("express");
const router = Router();
const TicketsModel = require("../../models/ticket");
const UsersModel = require("../../models/user");
const { Op } = require("sequelize");
const { isSpecialDate, transformDate } = require("../../helpers");
const { checkCallbackSignature } = require("../../middlewares/paymentMiddlewares");
const { generatePDFTicket, generateHTMLTicket } = require("../../services/ticketService");
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const constants = require("../../helpers/constants");


router.post("/", [checkIfSessionIsStarted, checkCallbackSignature], async (req, res, next) => {
    try {

        const {
            signature,
            data
        } = req?.body;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");
        
        const { currency_credit: currencyAbbr, amount: price, info } = JSON.parse(decodedData);
        const { passangersInfo, originId, destinationId, startDate, endDate } = JSON.parse(info);
        const adultPassangerRegex = new RegExp("^adult-passanger-[0-9]+");
        const childPassangerRegex = new RegExp("^child-passanger-[0-9]+");
        const passangersData = Object.entries(passangersInfo);
        const children = passangersData.filter(passangerArr => childPassangerRegex.test(passangerArr?.[0]));

        const ticket = await TicketsModel.create({
            "dateOfDeparture": startDate,
            "dateOfReturn": isSpecialDate(endDate) ? null : endDate,
            "price": price,
            "type": isSpecialDate(endDate) ? Object.values(constants).find(el => el === endDate) : constants.ROUND,
            "currencyAbbr": currencyAbbr,
            "originId": parseInt(originId),
            "destinationId": parseInt(destinationId),
            "children": JSON.stringify(children.reduce((acc, curr) =>{acc[curr[0]] = curr[1]; return acc;}, {})),
            "signature": signature
        });

        const getUserIds = async () => {
            const userIds = await Promise.all(
                passangersData.map(async (passangerArr, ind) => {
                    if(adultPassangerRegex.test(passangerArr[0])) {
                        saveEmailToSession(ind, passangerArr[1]?.[`email-${ind + 1}`]);
                        const candidate = await UsersModel.findOne({
                            where: {
                                [Op.or] : [
                                    {"phone": passangerArr[1]?.[`phone-${ind + 1}`]}, 
                                    {"email": passangerArr[1]?.[`email-${ind + 1}`] || null}
                                ]
                            }
                        });
                        
                        if(candidate) {
                            await candidate.update({ 
                                "email": passangerArr[1]?.[`email-${ind + 1}`] || null,  
                                "phone": passangerArr[1]?.[`phone-${ind + 1}`]
                            });
                            await candidate.save();
                            return candidate?.id;
                        } else {
                            const user = await UsersModel.create({
                                "name": passangerArr[1]?.[`name-${ind + 1}`],
                                "lastName": passangerArr[1]?.[`last-name-${ind + 1}`],
                                "phone":  passangerArr[1]?.[`phone-${ind + 1}`],
                                "additionalPhone": passangerArr[1]?.[`phone-additional-${ind + 1}`] || null,
                                "dateOfBirth": passangerArr[1]?.[`date-of-birth-${ind + 1}`],
                                "email": passangerArr[1]?.[`email-${ind + 1}`] || null,
                            });
                            return user?.id;
                        }
                    }
                })
            );
            return userIds;
        }


        function saveEmailToSession(ind, email){
            if(ind === 0) req.session.email = email;
        }

        const userIds = await getUserIds();
        await ticket.addUsers(userIds.filter(Boolean));

        
        req.session.save(function (err) {
            if (err) return next(err);

            return res.json({status: "ok"});
        });

        
    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


router.post("/generate", [checkIfSessionIsStarted, checkCallbackSignature], async (req, res) => {
    try {

        const {
            signature,
            data
        } = req?.body;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");

        const {currency_credit: currencyAbbr, amount: price, info} = JSON.parse(decodedData);
        const {passangersInfo, cities, places, dates} = JSON.parse(info);
        const passangersInfoData = Object.entries(passangersInfo);

        const html = await generateHTMLTicket({
            language: "uk_UA",
            cities,
            signature,
            price,
            currencyAbbr,
            passangersInfoData,
            dates,
            places
        });

        return res.send(html);

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
});


router.post("/generate-pdf", async (req, res) => {
    try {

        const {
            signature,
            html
        } = req?.body;

        const {pdfPath, pdfName} = await generatePDFTicket(signature, html);

        return res.download(pdfPath, function (err) {
            if (err) {
                throw err;
            } else {
                console.log("Sent downloaded:", pdfName);
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});


module.exports = router