const { strToSign } = require("../services/paymentService");

function checkCallbackSignature(req, res, next){
    try {
        const {
            data,
            signature
        } = req?.body;

        const signatureStr = strToSign(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY);

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