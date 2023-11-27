const nodemailer = require("nodemailer");
const { loadLanguageFile } = require("../helpers");


function createMailer(){
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT, //587
        secure: process.env.MAIL_SECURE, //false
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });


    return transporter;
}

function createAdminTicketLetter({subject: title, passangersData, email, translations, orderId, transactionId}){
    let output = `
    <html> 
        <head> 
            <title>${title}</title> 
        </head> 
        <body>
        <table>`;

        for(let i = 0; i < passangersData.length; i++) {
            if(i === 0) {
                output += passangersData[i][`passanger-${i + 1}-phone`] ? `<tr><td><b>${translations?.passengerPhoneText + " №" + (i + 1)}:</b></td><td>${passangersData[i][`passanger-${i + 1}-phone`]}</td></tr>` : "";
                output += passangersData[i][`passanger-${i + 1}-additionalPhone`] ? `<tr><td><b>${translations?.passengerAdditionalPhoneText + " №" + (i + 1)}:</b></td><td>${passangersData[i][`passanger-${i + 1}-additionalPhone`]}</td></tr>` : ""; 
                output += `<tr><td><b>${translations?.passengerEmailText + " №" + (i + 1)}:</b></td><td>${email}</td></tr>`;  
            } else {
                output += passangersData[i][`passanger-${i + 1}-phone`] ? `<tr><td><b>${translations?.passengerPhoneText + " №" + (i + 1)}:</b></td><td>${passangersData[i][`passanger-${i + 1}-phone`]}</td></tr>` : "";
                output += passangersData[i][`passanger-${i + 1}-additionalPhone`] ? `<tr><td><b>${translations?.passengerAdditionalPhoneText + " №" + (i + 1)}:</b></td><td>${passangersData[i][`passanger-${i + 1}-additionalPhone`]}</td></tr>` : ""; 
            }    
        }
    
    
    // output += `<tr><td><b>${translations?.transactionIdText}:</b></td><td>${transactionId}</td></tr>`;
    output += `<tr><td><b>${translations?.ordreIdText}:</b></td><td>${orderId}</td></tr>`;
    output += `</table>
            </body> 
        </html>`;
    
    return output;
} 

async function sendFileMail({
    email,
    passangersData,
    pdfPath, 
    subject,
    languageCode,
    transactionId,
    orderId
}){
    const translations = loadLanguageFile("_mail.js", languageCode);
    const emailAdresses = [email, process.env.ADMIN_EMAIL];

    const adminText = createAdminTicketLetter({subject, passangersData, email, translations, transactionId, orderId});

    for(let i = 0; i < emailAdresses.length; i++) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: emailAdresses[i],
            subject: emailAdresses[i] === process.env.ADMIN_EMAIL ?  subject + ` | (${translations?.transactionIdText}:${transactionId})` : subject,
            attachments: [{
              filename: "ticket.pdf",
              path: pdfPath,
              contentType: "application/pdf"
            }]
        };

        mailOptions[emailAdresses[i] === process.env.ADMIN_EMAIL ? "html" : "text"] = emailAdresses[i] === process.env.ADMIN_EMAIL ? adminText : translations?.text;

        const transporter = createMailer();
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.error(err);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

}

async function sendActivationMail(to, link){
    const transporter = createMailer();
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject: "Активація акаунту на " + process.env.API_URL,
        text: "",
        html: `
            <div>
                <h1>Для активації перейдіть за посиланням</h1>
                <a href="${link}">${link}</a>
            </div>
        `
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.error(err);
        } else {
            console.log('Activation email sent: ' + info.response);
        }
    });
}

module.exports = {
    sendActivationMail,
    sendFileMail
}