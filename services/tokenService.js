const jwt = require("jsonwebtoken");
const TokensModel = require("../models/token");
const { Op } = require("sequelize");

function generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_ACCESS, {
        expiresIn: "30m"
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
        expiresIn: "30d"
    });

    return {
        accessToken, 
        refreshToken
    }
}

async function saveToken(userId, refreshToken, deviceFingerprint){

    const tokenData = await TokensModel.findOne({
        where: {
            [Op.and]: [
                {userId: userId},
                {deviceFingerprint: deviceFingerprint}
            ]

        }
    });

    if(tokenData) {
        tokenData.refreshToken = refreshToken;
        return await tokenData.save();
    }

    const token = await TokensModel.create({
        userId, 
        refreshToken, 
        deviceFingerprint
    });

    return token;
}


async function deleteExpiredTokens(){

}

module.exports = {
    generateTokens,
    saveToken
}