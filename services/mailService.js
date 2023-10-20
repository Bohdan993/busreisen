const nodemailer = require("nodemailer");
const { loadLanguageFile } = require("../helpers");


function createMailer(){
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });


    return transporter;
}

async function sendFileMail(to, file, languageCode){
    const translations = loadLanguageFile("_mail.js", languageCode);
    const mailOptions = {
        from: "noreply@busreisen.com",
        to,
        subject: translations?.subjectText,
        text: translations?.text,
        attachments: [{
          filename: "ticket.pdf",
          path: file,
          contentType: "application/pdf"
        }]
    };

    const transporter = createMailer();
    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.error(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function sendActivationMail(to, link){
    const transporter = createMailer();
    const mailOptions = {
        from: "noreply@busreisen.com",
        to,
        subject: "Активація акаунту на " + process.env.API_URL,
        text: "",
        html: `
            <div>
                <h1>Для активації перейдіть по посиланню</h1>
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