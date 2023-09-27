const {
    Router
} = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const router = Router();
const TicketsModel = require("../../models/ticket");
const UsersModel = require("../../models/user");
const BusFlightsModel = require("../../models/busFlight");
const UserTicketModel = require("../../models/userTicket");
const { Op } = require("sequelize");
const { isSpecialDate, transformTimestampToDate } = require("../../helpers");
const { checkCallbackSignature } = require("../../middlewares/paymentMiddlewares");
const { checkIfSessionIsStarted, checkIfSessionIsFinished } = require("../../middlewares/sessionMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const { generatePDFTicket, generateHTMLTicket } = require("../../services/ticketService");
const constants = require("../../helpers/constants");


router.post("/", [checkIfSessionIsStarted, checkIfBusFlightSelected, checkCallbackSignature, checkIfSessionIsFinished], async (req, res, next) => {
    try {

        const {
            signature,
            data
        } = req?.body;

        const {
            selectedBusFlight,
            children: numOfChildren,
            adults: numOfAdults
        } =  req.session;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");
        
        const { currency: currencyAbbr, amount: price, info } = JSON.parse(decodedData);
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


        // const busFlights = await BusFlightsModel.findAll({
        //     attributes: ["id", "freeSeats"],
        //     where: {
        //         [Op.or]: [
        //             {dateOfDeparture: startDate, routeId: selectedBusFlight?.places?.from?.routeId || null},
        //             {dateOfDeparture: isSpecialDate(endDate) ? null : endDate, routeId: selectedBusFlight?.places?.to?.routeId || null}
        //         ]  
        //     }
        // });

        // busFlights.forEach(async busFlight => {
        //     await busFlight.update({
        //         freeSeats: parseInt(busFlight.freeSeats) - (parseInt(numOfChildren) + parseInt(numOfAdults))
        //     });
        //     await busFlight.save();
        // });

        await BusFlightsModel.increment({ freeSeats: -(parseInt(numOfChildren) + parseInt(numOfAdults)) }, {
            where: {
                [Op.or]: [
                    {dateOfDeparture: startDate, routeId: selectedBusFlight?.places?.from?.routeId || null},
                    {dateOfDeparture: isSpecialDate(endDate) ? null : endDate, routeId: selectedBusFlight?.places?.to?.routeId || null}
                ] 
            }
        });

        const getUserData = async () => {
            const userData = await Promise.all(
                passangersData.map(async (passangerArr, ind) => {
                    if(adultPassangerRegex.test(passangerArr[0])) {
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

                            const dataObj = {
                                userId: candidate?.id,
                                ticketId: ticket?.id
                            }

                            if(passangerArr[1]?.[`discount-${ind + 1}`]) {
                                dataObj["userDiscountId"] = passangerArr[1]?.[`discount-${ind + 1}`];
                            }

                            if(passangerArr[1]?.[`card-discount-${ind + 1}`]) {
                                dataObj["discountCardNumber"] = passangerArr[1]?.[`card-discount-${ind + 1}`];
                            }

                            return  dataObj;

                        } else {
                            const user = await UsersModel.create({
                                "name": passangerArr[1]?.[`name-${ind + 1}`],
                                "lastName": passangerArr[1]?.[`last-name-${ind + 1}`],
                                "phone":  passangerArr[1]?.[`phone-${ind + 1}`],
                                "additionalPhone": passangerArr[1]?.[`phone-additional-${ind + 1}`] || null,
                                "dateOfBirth": passangerArr[1]?.[`date-of-birth-${ind + 1}`],
                                "email": passangerArr[1]?.[`email-${ind + 1}`] || null,
                            });

                            const dataObj = {
                                userId: user?.id,
                                ticketId: ticket?.id
                            }

                            if(passangerArr[1]?.[`discount-${ind + 1}`]) {
                                dataObj["userDiscountId"] = passangerArr[1]?.[`discount-${ind + 1}`];
                            }

                            if(passangerArr[1]?.[`card-discount-${ind + 1}`]) {
                                dataObj["discountCardNumber"] = passangerArr[1]?.[`card-discount-${ind + 1}`];
                            }

                            return dataObj;
                        }
                    }

                    return null;
                })
            );
            return userData;
        }

        const userData = (await getUserData()).filter(Boolean);

        await UserTicketModel.bulkCreate(userData);

        req.session.ticket = ticket?.toJSON();
        req.session.save(function (err) {
            if (err) return next(err);

            return res.json({status: "ok"});
        });

        
    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.post("/generate", [checkIfSessionIsStarted, checkCallbackSignature], async (req, res, next) => {
    try {

        const {
            languageCode = 'uk_UA'
        } = req?.query;

        const {
            signature,
            data
        } = req?.body;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");

        const {currency: currencyAbbr, amount: price, info} = JSON.parse(decodedData);
        const {passangersInfo, cities, places, dates} = JSON.parse(info);
        const passangersInfoData = Object.entries(passangersInfo);

        const html = await generateHTMLTicket({
            languageCode,
            cities,
            signature,
            price,
            currencyAbbr,
            passangersInfoData,
            dates,
            places,
            // ticket
        });

        req.session.isFinished = true;

        req.session.save(function (err) {
            if (err) return next(err);
            return res.send(html);
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
});


router.post("/generate-pdf", [/*checkIfSessionIsStarted,*/ checkCallbackSignature], async (req, res, next) => {
    try {

        const {
            ticket
        } = req?.session;

        const {
            data,
            signature
        } = req?.body;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");
        const { currency: currencyAbbr, amount: price, info} = JSON.parse(decodedData);
        const { passangersInfo, cities, places, dates, languageCode} = JSON.parse(info);
        const passangersInfoData = Object.entries(passangersInfo);
        const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
        const pdfName = pdfHash + ".pdf";
        const pdfPath = path.resolve("assets", "tickets", pdfName);

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

                        const { pdfPath, pdfName } = await generatePDFTicket(signature, html);
                        return res({pdfPath, pdfName});
                        
                    }

                    return res({pdfPath, pdfName});
                } catch(err) {
                    return rej(err);
                }
            });
        });

        const {pdfPath: newPdfPath, pdfName: newPdfName} = await promise;
        
        req.session.destroy(function (err) {
            if (err) return next(err);

            return res.download(newPdfPath, function (err) {
                if (err) {
                    throw err;
                } else {
                    console.log("Sent downloaded:", newPdfName);
                }
            });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});



module.exports = router