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

async function removeToken(refreshToken){
    const tokenData = await TokensModel.deleteOne({refreshToken});
    return tokenData;
}

async function findToken(refreshToken){
    const tokenData = await TokensModel.findOne({refreshToken});
    return tokenData;
}

function validateAccessToken(token){
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
        return userData;
    } catch(err) {
        return null;
    }
}

function validateRefreshToken(token){
    try {
        const userData = jwt.verify(token, process.env.JWT_SECRET_REFRESH);
        return userData;
    } catch(err) {
        return null;
    }
}

async function deleteExpiredTokens(){

}

module.exports = {
    generateTokens,
    saveToken,
    removeToken,
    findToken,
    validateRefreshToken,
    validateAccessToken
}