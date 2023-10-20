const {
    Router
} = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const router = Router();
const TicketsModel = require("../../models/ticket");
const PassangersModel = require("../../models/passanger");
const BusFlightsModel = require("../../models/busFlight");
const PassangerTicketModel = require("../../models/passangerTicket");
const { Op } = require("sequelize");
const { isSpecialDate, transformTimestampToDate } = require("../../helpers");
const { checkCallbackSignature } = require("../../middlewares/paymentMiddlewares");
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const { checkIfTicketCreated } = require("../../middlewares/ticketMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const { generatePDFTicket, generateHTMLTicket } = require("../../services/ticketService");
const { sendFileMail } = require("../../services/mailService");
const constants = require("../../helpers/constants");



router.post("/", [checkIfSessionIsStarted, checkIfBusFlightSelected, checkCallbackSignature, checkIfTicketCreated], async (req, res, next) => {
    try {

        const {
            languageCode = 'uk_UA'
        }  = req?.query;

        const {
            signature,
            data
        } = req?.body;

        const {
            selectedBusFlight,
            children: numOfChildren,
            adults: numOfAdults,
            originId,
            destinationId,
            startDate,
            endDate,
            passangersInfo
        } = req.session;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");
        
        const { currency: currencyAbbr, amount: price } = JSON.parse(decodedData);
        const adultPassangerRegex = new RegExp("^adult-passanger-[0-9]+");
        const childPassangerRegex = new RegExp("^child-passanger-[0-9]+");
        const passangersInfoData = Object.entries(passangersInfo);
        const children = passangersInfoData.filter(passangerArr => childPassangerRegex.test(passangerArr?.[0]));

        let ticket = await TicketsModel.create({
            "dateOfDeparture": startDate,
            "dateOfReturn": isSpecialDate(endDate) ? null : endDate,
            "busFlightFromId": selectedBusFlight?.busFlightFromId,
            "busFlightToId": selectedBusFlight?.busFlightToId,
            "price": price,
            "type": isSpecialDate(endDate) ? Object.values(constants).find(el => el === endDate) : constants.ROUND,
            "currencyAbbr": currencyAbbr,
            "originId": parseInt(originId),
            "destinationId": parseInt(destinationId),
            "children": JSON.stringify(children.reduce((acc, curr) =>{acc[curr[0]] = curr[1]; return acc;}, {})),
            "signature": signature,
            "status": constants.TICKET_STATUS_PAYED
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

        const getPassangerData = async () => {
            const passangerData = await Promise.all(
                passangersInfoData.map(async (passangerArr, ind) => {
                    if(adultPassangerRegex.test(passangerArr[0])) {
                        const passangerQuery = {where: {"phone": passangerArr[1]?.[`phone-${ind + 1}`]}}

                        // if(passangerArr[1]?.[`email-${ind + 1}`]) {
                        //     passangerQuery.where = {
                        //         [Op.and]: [
                        //             {"phone": passangerArr[1]?.[`phone-${ind + 1}`]}, 
                        //             {"email": passangerArr[1]?.[`email-${ind + 1}`]}
                        //         ]
                        //     }
                        // }

                        // console.log("PASSANGER QUERY " + (ind + 1), passangerQuery);

                        const candidate = await PassangersModel.findOne(passangerQuery);
                        console.log("CANDIDATE", candidate);
                        if(candidate) {
                            console.log("EMAIL", passangerArr[1]?.[`email-${ind + 1}`] || null);
                            console.log("PHONE", passangerArr[1]?.[`phone-${ind + 1}`]);
                            // await candidate.update({ 
                            //     "email": passangerArr[1]?.[`email-${ind + 1}`] || null,  
                            //     "phone": passangerArr[1]?.[`phone-${ind + 1}`]
                            // });
                            // await candidate.save();

                            const dataObj = {
                                passangerId: candidate?.id,
                                ticketId: ticket?.id
                            }

                            if(parseInt(passangerArr[1]?.[`discount-${ind + 1}`])) {
                                dataObj["passangerDiscountId"] = passangerArr[1]?.[`discount-${ind + 1}`];
                            }

                            if(passangerArr[1]?.[`card-discount-${ind + 1}`]) {
                                dataObj["discountCardNumber"] = passangerArr[1]?.[`card-discount-${ind + 1}`];
                            }

                            return  dataObj;

                        } else {
                            const passanger = await PassangersModel.create({
                                "name": passangerArr[1]?.[`name-${ind + 1}`],
                                "lastName": passangerArr[1]?.[`last-name-${ind + 1}`],
                                "phone":  passangerArr[1]?.[`phone-${ind + 1}`],
                                "additionalPhone": passangerArr[1]?.[`phone-additional-${ind + 1}`] || null,
                                "dateOfBirth": passangerArr[1]?.[`date-of-birth-${ind + 1}`],
                                "email": passangerArr[1]?.[`email-${ind + 1}`] || null,
                            });

                            const dataObj = {
                                passangerId: passanger?.id,
                                ticketId: ticket?.id
                            }

                            if(parseInt(passangerArr[1]?.[`discount-${ind + 1}`])) {
                                dataObj["passangerDiscountId"] = passangerArr[1]?.[`discount-${ind + 1}`];
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
            return passangerData;
        }

        const passangerData = (await getPassangerData()).filter(Boolean);
        
        ticket = ticket?.toJSON();
        ticket.createdAt = ticket.createdAt.toISOString();

        await PassangerTicketModel.bulkCreate(passangerData);

        const html = await generateHTMLTicket({
            languageCode,
            cities: selectedBusFlight.cities,
            signature,
            price,
            currencyAbbr,
            passangersInfoData,
            dates: selectedBusFlight.dates,
            places: selectedBusFlight.places,
            ticket,
            constants,
            template: "full-ticket.pug",
            transformTimestampToDate
        });

        await generatePDFTicket(signature, html);

        req.session.ticketCreated = true;
        req.session.save(function (err) {
            if (err) return next(err);

            return res.json({status: "ok"});
        });

        
    } catch (err) {
        return next(err);
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

        const {
            selectedBusFlight,
            passangersInfo
        } = req.session;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");

        const {currency: currencyAbbr, amount: price} = JSON.parse(decodedData);
        const passangersInfoData = Object.entries(passangersInfo);

        const html = await generateHTMLTicket({
            languageCode,
            cities: selectedBusFlight.cities,
            signature,
            price,
            currencyAbbr,
            passangersInfoData,
            dates: selectedBusFlight.dates,
            places: selectedBusFlight.places
        });

        req.session.save(function (err) {
            if (err) return next(err);
            return res.send(html);
        });
        
    } catch (err) {
        return next(err);
    }
});

router.post("/generate-pdf", checkCallbackSignature, async (req, res, next) => {
    try {
        const {
            signature
        } = req?.body;

        const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
        const pdfName = pdfHash + ".pdf";
        const pdfPath = path.resolve("assets", "tickets", pdfName);

        const promise = new Promise((res, rej) => {
            fs.readFile(pdfPath, async function (err, fileData) {
                try {
                    if (err) return next(err);
                    return res({pdfPath, pdfName});
                } catch(err) {
                    return rej(err);
                }
            });
        });

        const {pdfPath: newPdfPath, pdfName: newPdfName} = await promise;

        return res.download(newPdfPath, function (err) {
            if (err) return next(err);
            console.log("Sent downloaded:", newPdfName);
        });

    } catch (err) {
        return next(err);
    }
    
});

router.post("/send", [checkIfSessionIsStarted, checkCallbackSignature], async (req, res, next) => {
    try {

        const {
            languageCode = 'uk_UA'
        }  = req?.query;

        const {
            signature
        } = req?.body;

        const {
            email
        } = req.session;

        const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
        const pdfName = pdfHash + ".pdf";
        const pdfPath = path.resolve("assets", "tickets", pdfName);

        const promise = new Promise((res, rej) => {
            fs.readFile(pdfPath, async function (err, fileData) {
                try {
                    if (err) return next(err);
                    await sendFileMail(email, pdfPath, languageCode);
                    return res();
                } catch(err) {
                    return rej(err);
                }
            });
        });

        await promise;

        req.session.destroy(function (err) {
            if (err) return next(err);
            return res.json({status: "ok"});
        });

    } catch (err) {
        return next(err);
    }
    
});



module.exports = router