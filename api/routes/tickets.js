const {
    Router
} = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const router = Router();
const { Op } = require("sequelize");
const { 
    busflight: BusFlight, 
    passenger: Passenger,
    passengerticket: PassengerTicket,
    ticket: Ticket
  } = require("../../database/models/index");
const { getTicketSubject } = require("../../helpers/index");

const { isSpecialDate, transformTimestampToDate } = require("../../helpers");
const { checkCallbackSignature } = require("../../middlewares/paymentMiddlewares");
const { checkIfSessionIsStarted } = require("../../middlewares/sessionMiddlewares");
const { checkIfTicketNotCreated } = require("../../middlewares/ticketMiddlewares");
const { checkIfBusFlightSelected } = require("../../middlewares/busFlightMiddlewares");
const { checkIfPassengersInfoExists } = require("../../middlewares/passengersMiddleware");
const { generatePDFTicket, generateHTMLTicket } = require("../../services/ticketService");
const { sendFileMail } = require("../../services/mailService");
const constants = require("../../helpers/constants");

router.post("/", [
        checkIfSessionIsStarted, 
        checkIfBusFlightSelected, 
        checkIfPassengersInfoExists, 
        checkCallbackSignature, 
        checkIfTicketNotCreated
    ], async (req, res, next) => {
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
            passengersInfo
        } = req.session;

        const decodedData = Buffer.from(data, "base64").toString("utf-8");
        
        const { currency: currencyAbbr, amount: price, info } = JSON.parse(decodedData);
        const adultPassengerRegex = new RegExp("^adult-passenger-[0-9]+");
        const childPassengerRegex = new RegExp("^child-passenger-[0-9]+");
        const passengersInfoData = Object.entries(passengersInfo);
        const children = passengersInfoData.filter(passengerArr => childPassengerRegex.test(passengerArr?.[0]));
        const { originalCurrency, originalPrice } = JSON.parse(info);

        let ticket = await Ticket.create({
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
            "status": constants.TICKET_STATUS_PAYED,
            "hasDiscount": selectedBusFlight?.hasDiscount,
            "discountPercentage": selectedBusFlight?.discountPercentage || 0,
        });


        await BusFlight.increment({ freeSeats: -(parseInt(numOfChildren) + parseInt(numOfAdults)) }, {
            where: {
                [Op.or]: [
                    {dateOfDeparture: startDate, routeId: selectedBusFlight?.places?.from?.routeId || null},
                    {dateOfDeparture: isSpecialDate(endDate) ? null : endDate, routeId: selectedBusFlight?.places?.to?.routeId || null}
                ] 
            }
        });

        const getPassengerData = async () => {
            const passengerData = await Promise.all(
                passengersInfoData.map(async (passengerArr, ind) => {
                    if(adultPassengerRegex.test(passengerArr[0])) {
                        const passengerQuery = {where: {"phone": passengerArr[1]?.[`phone-${ind + 1}`]}}

                        const candidate = await Passenger.findOne(passengerQuery);
                        if(candidate) {

                            const dataObj = {
                                passengerId: candidate?.id,
                                ticketId: ticket?.id
                            }

                            if(parseInt(passengerArr[1]?.[`discount-${ind + 1}`])) {
                                dataObj["passengerDiscountId"] = passengerArr[1]?.[`discount-${ind + 1}`];
                            }

                            if(passengerArr[1]?.[`card-discount-${ind + 1}`]) {
                                dataObj["discountCardNumber"] = passengerArr[1]?.[`card-discount-${ind + 1}`];
                            }

                            return  dataObj;

                        } else {
                            const passenger = await Passenger.create({
                                "name": passengerArr[1]?.[`name-${ind + 1}`],
                                "lastName": passengerArr[1]?.[`last-name-${ind + 1}`],
                                "phone":  passengerArr[1]?.[`phone-${ind + 1}`],
                                "additionalPhone": passengerArr[1]?.[`phone-additional-${ind + 1}`] || null,
                                "dateOfBirth": passengerArr[1]?.[`date-of-birth-${ind + 1}`],
                                "email": passengerArr[1]?.[`email-${ind + 1}`] || null,
                            });

                            const dataObj = {
                                passengerId: passenger?.id,
                                ticketId: ticket?.id
                            }

                            if(parseInt(passengerArr[1]?.[`discount-${ind + 1}`])) {
                                dataObj["passengerDiscountId"] = passengerArr[1]?.[`discount-${ind + 1}`];
                            }

                            if(passengerArr[1]?.[`card-discount-${ind + 1}`]) {
                                dataObj["discountCardNumber"] = passengerArr[1]?.[`card-discount-${ind + 1}`];
                            }

                            return dataObj;
                        }
                    }

                    return null;
                })
            );
            return passengerData;
        }

        const passengerData = (await getPassengerData()).filter(Boolean);
        
        ticket = ticket?.toJSON();
        ticket.createdAt = ticket.createdAt.toISOString();

        await PassengerTicket.bulkCreate(passengerData);

        const html = await generateHTMLTicket({
            languageCode,
            cities: selectedBusFlight.cities,
            signature,
            price: originalPrice,
            convertedPrice: price,
            currencyAbbr: originalCurrency,
            passengersInfoData,
            dates: selectedBusFlight.dates,
            places: selectedBusFlight.places,
            ticket,
            constants,
            template: "full-ticket.pug",
            transformTimestampToDate
        });

        await generatePDFTicket(signature, html);

        req.session.ticketCreated = true;
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

router.post("/generate", [
        checkIfSessionIsStarted, 
        checkIfPassengersInfoExists, 
        checkCallbackSignature
    ], async (req, res, next) => {
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
                passengersInfo
            } = req?.session;

            const decodedData = Buffer.from(data, "base64").toString("utf-8");

            const {currency: currencyAbbr, amount: price} = JSON.parse(decodedData);
            const passengersInfoData = Object.entries(passengersInfo);

            const html = await generateHTMLTicket({
                languageCode,
                cities: selectedBusFlight.cities,
                signature,
                price,
                currencyAbbr,
                passengersInfoData,
                dates: selectedBusFlight.dates,
                places: selectedBusFlight.places
            });

            return req.session.destroy(function (err) {
                if (err) return next(err);
                return res.send(html);
            });
            
        } catch (err) {
            return next(err);
        }
});

router.post("/send", [
    checkIfSessionIsStarted,
    checkIfBusFlightSelected,
    checkIfPassengersInfoExists,
    checkCallbackSignature
    ], async (req, res, next) => {
        try {

            const {
                languageCode = 'uk_UA'
            }  = req?.query;

            const {
                data,
                signature
            } = req?.body;

            const {
                email,
                selectedBusFlight,
                passengersInfo
            } = req.session;

            const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
            const pdfName = pdfHash + ".pdf";
            const pdfPath = path.resolve("assets", "tickets", pdfName);
            const passengersInfoData = Object.entries(passengersInfo);
            const passangersData = passengersInfoData.map((passengerArr, ind) => {
                const map = {
                    [`passanger-${ind + 1}-phone`]: passengerArr[1]?.[`phone-${ind + 1}`] || null,
                    [`passanger-${ind + 1}-additionalPhone`]: passengerArr[1]?.[`phone-additional-${ind + 1}`] || null,
                };

                return map;
            });

            const promise = new Promise((res, rej) => {
                fs.readFile(pdfPath, async function (err, fileData) {
                    try {
                        if (err) return next(err);
                        await sendFileMail({
                            email,
                            passangersData, 
                            pdfPath, 
                            subject: getTicketSubject(selectedBusFlight, languageCode), 
                            languageCode,
                            transactionId: data?.transaction_id,
                            orderId: data?.order_id
                        });
                        console.log("ORDER DATA", data);
                        return res();
                    } catch(err) {
                        return rej(err);
                    }
                });
            });

            await promise;
            req.session.flag = !req.session.flag;
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

router.post("/payment-fail", [checkIfSessionIsStarted, checkCallbackSignature], async (req, res, next) => {
        try {

            const {
                data,
                error
            } = req?.body;

            const decodedData = Buffer.from(data?.data, "base64").toString("utf-8");

            console.log("Fail. Passangers data: ", JSON.parse(decodedData));
            console.log("Fail. Payment data: ", data);
            console.log("Erro msg:", error);
            console.log("(Date: " + new Date().toUTCString() + ")");

            return req.session.destroy(function (err) {
                if (err) return next(err);
                return res.json({status: "ok"});
            });

        } catch (err) {
            return next(err);
        }

});

module.exports = router