const { strToSign } = require("../services/paymentService");

function checkCallbackSignature(req, res, next){
    console.log("REQ URL", req?.goriginalUrl);
    console.log("REQ BODY", req?.body);

    const {
        data,
        signature
    } = req?.body;

    const signatureStr = strToSign(process.env.LIQPAY_PRIVATE_KEY + data + process.env.LIQPAY_PRIVATE_KEY);

    if(signatureStr === signature) {
        next();
        return;
    }

    return res.status(500).json({status: "fail", error: "invalid signature"});
    
}

module.exports = {
    checkCallbackSignature
}