const { strToSign } = require("../services/paymentService");

function checkCallbackSignature(req, res, next){
    try {
        const {
            data,
            signature
        } = req?.body;

        let signatureStr;

        if(req.originalUrl.split("?")[0] === "/api/tickets/send") {
            signatureStr = strToSign(process.env.LIQPAY_PRIVATE_KEY + data?.data + process.env.LIQPAY_PRIVATE_KEY);
            if(signatureStr === signature) {
                next();
                return;
            }
        }

        signatureStr = strToSign(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY);
        if(signatureStr === signature) {
            next();
            return;
        }

        throw new Error("invalid signature");
    } catch(err) {
        return next(err);
    }
    
}

module.exports = {
    checkCallbackSignature
}