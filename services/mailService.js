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

function createAdminTicketLetter(title, phone, email, translations){
    return (`
        <html> 
            <head> 
                <title>${title}</title> 
            </head> 
            <body>
            <table>
                <tr><td><b>${translations?.passengerPhoneText}:</b></td><td>${phone}</td></tr>
                <tr><td><b>${translations?.passengerEmailText}:</b></td><td>${email}</td></tr>
            </table>
            </body> 
        </html>
    `);
} 

async function sendFileMail({
    email,
    phone, 
    pdfPath, 
    subject,
    languageCode
}){
    const translations = loadLanguageFile("_mail.js", languageCode);
    const emailAdresses = [email, process.env.ADMIN_EMAIL];

    const adminText = createAdminTicketLetter(subject, phone, email, translations);

    for(let i = 0; i < emailAdresses.length; i++) {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: emailAdresses[i],
            subject,
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