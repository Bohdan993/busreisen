const crypto = require("crypto");
const path = require("path");
const HTMLToPDF = require("html-pdf-node");
const QRCode = require("qrcode");
const pug = require("pug");
const { loadLanguageFile } = require("../helpers");

async function generatePDFTicket(signature, html){
    const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
    const pdfName = pdfHash + ".pdf";
    const pdfPath = path.resolve("assets", "tickets", pdfName);
    const pdfOptions = {
        path: pdfPath,
        margin: {
            top: 35,
            left: 0,
            right: 0,
            bottom: 0
        }
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
        passangersInfoData,
        dates,
        places
    }
    ) {
    
    const ticketTemplate = path.resolve("views", "ticket.pug");

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
                            translations: loadLanguageFile("ticket.js", languageCode),
                            data: {
                                price, 
                                passangersInfo: passangersInfoData, 
                                startDate: dates?.departure, 
                                endDate: dates?.return,
                                origin: cities?.from?.name,
                                destination: cities?.to?.name,
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