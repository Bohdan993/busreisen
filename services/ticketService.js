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
        passangersInfoData,
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
                                passangersInfo: passangersInfoData, 
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

// async function createPDFTicket(
//     {
//         languageCode,
//         cities,
//         signature,
//         price,
//         currencyAbbr,
//         passangersInfoData,
//         dates,
//         places
//     } = {}
//     ) {
//         return new Promise((res, rej) => {
//             QRCode.toDataURL(signature,
//                 {
//                     color: {
//                             dark: "#1B3B7F",
//                             light: "#FFFFFF"
//                     }
//                 }, 
//                 async function (err, url) {
//                     if (err) rej(err);
                    
//                     try {
//                         const pdfHash = crypto.createHash("sha256").update(signature).digest("hex");
//                         const pdfName = pdfHash + ".pdf";
//                         const pdfPath = path.resolve("assets", "tickets", pdfName);

//                         const ticketNumber = await TicketModel.findOne({
//                             attributes: ["uuid"],
//                             where: {
//                                 signature: {
//                                     [Op.eq]: signature
//                                 }
//                             }
//                         });
                        
//                         // Create a document
//                         const doc = new PDFDocument({size: 'A4', font: 'Times-Roman'});
                
//                         // Pipe its output somewhere, like to a file or HTTP response
//                         // See below for browser usage
//                         doc.pipe(fs.createWriteStream(pdfPath));
//                         doc
//                         .addPage({
//                             margin: 80
//                         })
//                         .fontSize(24);
                
//                         // Embed a font, set the font size, and render some text

//                         doc
//                         .text('Квиток на рейс', {
//                             align: 'center'
//                         });

//                         // let textWidth = doc.widthOfString("Номер квитка: ");
//                         doc.moveDown()
//                         .fontSize(16)
//                         .text(`Номер квитка: ` , {
//                             align: 'center'
//                         })
//                         .fontSize(18)
//                         .text(`${ticketNumber?.uuid}`);
                
//                         // Add an image, constrain it to a given size, and center it vertically and horizontally
//                         doc.image(path.resolve("assets", "images", "logo_benz_express.png"), {
//                         fit: [250, 300],
//                         align: 'center',
//                         valign: 'center'
//                         });
                
//                         // Add another page
//                         // doc
//                         // .addPage()
//                         // .fontSize(25)
//                         // .text('Here is some vector graphics...', 100, 100);
                
//                         // // Draw a triangle
//                         // doc
//                         // .save()
//                         // .moveTo(100, 150)
//                         // .lineTo(100, 250)
//                         // .lineTo(200, 250)
//                         // .fill('#FF3300');
                
//                         // // Apply some transforms and render an SVG path with the 'even-odd' fill rule
//                         // doc
//                         // .scale(0.6)
//                         // .translate(470, -380)
//                         // .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
//                         // .fill('red', 'even-odd')
//                         // .restore();
                
//                         // // Add some text with annotations
//                         // doc
//                         // .addPage()
//                         // .fillColor('blue')
//                         // .text('Here is a link!', 100, 100)
//                         // .underline(100, 100, 160, 27, { color: '#0000FF' })
//                         // .link(100, 100, 160, 27, 'http://google.com/');
                
//                         // Finalize PDF file
//                         doc.end();
                        
//                         res({
//                             pdfPath,
//                             pdfName
//                         });
//                     } catch (err) {
//                         rej(err);
//                     }
//                 }
//             );
//         });

// }


module.exports = {
    generatePDFTicket,
    generateHTMLTicket,
    // createPDFTicket
}