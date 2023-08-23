const {
    Router
} = require("express");
const router = Router();
const crypto = require("crypto");
const {v4: uuidv4} = require("uuid");
// const City = require("../../models/city");
// const LanguagesModel = require("../../models/language");
// const CountriesModel = require("../../models/country");
// const CountryAttributes = require("../../models/countryAttributes");
// const CityAttributes = require("../../models/cityAttributes");
const UserModel = require("../../models/user");
const { Op } = require("sequelize");
const { sendActivationMail } = require("../../services/mailService");
const { generateTokens, saveToken } = require("../../services/tokenService");




async function registration(email, password, name, deviceFingerprint) {
    const candidate = await UserModel.findOne({
        where: {
            [Op.and] : [
                {email: email},
                {password: {
                    [Op.not]: null
                }}
            ]
            
        }
    });

    if(candidate){
        throw new Error(`Користувач з такою email адресою ${email} уже існує`);
    }

    const hashedPassword = await bcrypt.hash(password, 5);
    const activationLink = uuidv4();
    const user = await UserModel.create({
        name,
        password: hashedPassword, 
        email,
        activationLink
    });
    await sendActivationMail(email, activationLink);
    const userData = {id: user?.id, name: user?.name, email: user?.email, isActivated: user?.isActivated}
    const tokens = generateTokens(userData);
    await saveToken(user?.id, tokens?.refreshToken, deviceFingerprint);

    return {
        ...tokens,
        user: userData
    }
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req?.body;
        const deviceFingerprint = req.fingerprint?.hash;
        const registrationData = await registration(email, password, name, deviceFingerprint);
        res.cookie("refreshToken", registrationData?.refreshToken, {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            // secure: true 
        });
        return res.json({status: "ok", data: registrationData});
    } catch (err) {
        // console.log(err);
        console.log(err?.message);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.post("/login", async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.post("/logout", async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.get("/activate/:link", async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.get("/refresh", async (req, res) => {
    try {

    } catch (err) {
        console.log(err);
        res.status(500).json({status: "fail", error: "Server error"});
    }
    
});

router.get("/test", async (req, res) => {
    // console.log(req.fingerprint);

    res.json({status: "ok", data: req.fingerprint?.hash});
});


module.exports = router