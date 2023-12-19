const {
    Router
} = require("express");
const { registration, activation, login, logout, refresh } = require("../../../services/userService");
const router = Router();
const { body, validationResult } = require("express-validator");
const AdminAPIError = require("../../../exeptions/admin/api-error");


router.post("/register", 
    body("name")
    .isLength({min: 2, max: 30}),
    body(
        "email"
    ).isEmail(), 
    body(
        "password"
    ).isLength({min: 6, max: 32}), 
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return next(AdminAPIError.ValidationError("Помилка при валідації", errors.array()));
            }
            const { email, password, name } = req?.body;
            const deviceFingerprint = req.fingerprint?.hash;
            const registrationData = await registration(email, password, name, deviceFingerprint);
            res.cookie("refreshToken", registrationData?.refreshToken, {
                maxAge: 30 * 24 * 60 * 60,
                httpOnly: true,
                secure: true 
            });
            return res.json({status: "ok", data: registrationData});
        } catch (err) {
            return next(err);
        }
        
    }
);

router.post("/login",
    body(
        "email"
    ).isEmail(), 
    body(
        "password"
    ).isLength({min: 6, max: 32}), 
async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return next(AdminAPIError.ValidationError("Помилка при валідації", errors.array()));
        }
        const { email, password } = req.body;
        const deviceFingerprint = req.fingerprint?.hash;
        const userData = await login(email, password, deviceFingerprint);
        res.cookie("refreshToken", userData?.refreshToken, {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            secure: true 
        });
        return res.json({status: "ok", data: userData});
    } catch (err) {
        return next(err);
    }
    
});

router.post("/logout", async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        const token = await logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.json({status: "ok"});
    } catch (err) {
        return next(err);
    }
    
});

router.get("/activate/:link", async (req, res, next) => {
    try {
        const activationLink = req.params.link;
        await activation(activationLink);
        return res.redirect(process.env.ADMIN_URL + "/login");
    } catch (err) {
        return next(err);
    }
    
});

router.get("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        // const {email, password} = req.body;
        const deviceFingerprint = req.fingerprint?.hash;
        const userData = await refresh(refreshToken, deviceFingerprint);
        res.cookie("refreshToken", userData?.refreshToken, {
            maxAge: 30 * 24 * 60 * 60,
            httpOnly: true,
            secure: true 
        });
        return res.json({status: "ok", data: userData});
    } catch (err) {
        return next(err);
    }
    
});

// router.get("/test", async (req, res, next) => {
//     res.json({status: "ok", data: req.fingerprint?.hash});
// });


module.exports = router