const crypto = require("crypto");
const path = require("path");
const HTMLToPDF = require("html-pdf-node");
const QRCode = require("qrcode");
const pug = require("pug");
const { loadLanguageFile, base64Encode, includeFunc } = require("../helpers");



async function generatePDFTicket(signature, html){
    const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
    const pdfName = pdfHash + ".pdf";
    const pdfPath = path.resolve("assets", "tickets", pdfName);
    const pdfOptions = {
        path: pdfPath,
        margin: {top: "10px", bottom: "10px", left: "5px", right: "5px"},
        printBackground: true,
        format: 'A4',
    };
    const fileOptions = {
        content: html
    };

    return new Promise(async (res, rej) => {
        try {
            await HTMLToPDF.generatePdf(fileOptions, pdfOptions);
            res({pdfPath, pdfName});
        } catch(err) {
            rej(err);
        }
    });
}

async function generateHTMLTicket(
    {
        languageCode = "uk_UA",
        cities,
        signature,
        price,
        convertedPrice = 0,
        currencyAbbr,
        passengersInfoData,
        dates,
        places,
        ticket,
        constants,
        template = "ticket.pug",
        transformTimestampToDate = () => {}
    } = {}
    ) {
    
    const ticketTemplate = path.resolve("views", template);
    const termsOfUsePath = path.resolve("views", "ticket-terms-of-use", `${languageCode}.pug`);

    return new Promise((res, rej) => {
        QRCode.toDataURL(signature,
            {
                color: {
                        dark: "#1B3B7F",
                        light: "#FFFFFF"
                }
            }, 
            function (err, url) {
                if (err) rej(err);
                
                try {
                    const html = pug.renderFile(ticketTemplate, 
                        {
                            qr: url,
                            logo: "data:image/png;base64," + base64Encode(path.resolve("assets", "images", "logo_benz_express.png")),
                            translations: loadLanguageFile("_ticket.js", languageCode),
                            constants,
                            transformTimestampToDate,
                            include: template === "full-ticket.pug" ? includeFunc.bind(null, pug) : null,
                            termsOfUsePath: template === "full-ticket.pug" ? termsOfUsePath : null,
                            data: {
                                price,
                                convertedPrice,
                                currencyAbbr,
                                passengersInfo: passengersInfoData, 
                                startDate: dates?.departure, 
                                endDate: dates?.return,
                                origin: cities?.from?.name,
                                destination: cities?.to?.name,
                                ticket,
                                places
                            }
                        }
                    );
                    res(html);
                } catch (err) {
                    rej(err);
                }
            }
        );
    });

}

module.exports = {
    generatePDFTicket,
    generateHTMLTicket
}