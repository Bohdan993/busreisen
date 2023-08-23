const nodemailer = require("nodemailer");

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

async function sendFileMail(to, file){
    const mailOptions = {
        from: "noreply@busreisen.com",
        to,
        subject: "Ваш квиток",
        text: "Перевірте Ваш квиток у вкладеному файлі",
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

}

async function sendTestMail(to){
    const mailOptions = {
        from: "noreply@busreisen.com",
        to,
        subject: "Ваш квиток",
        text: "Перевірте Ваш квиток у вкладеному файлі",
    };

    const transporter = createMailer();


    return new Promise((res, rej) => {
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.error(err);
                rej();
            } else {
                console.log('Email sent: ' + info.response);
                res();
            }
        });
    });
}

module.exports = {
    sendActivationMail,
    sendFileMail,
    sendTestMail
}