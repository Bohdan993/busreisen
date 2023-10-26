const AdminAPIError = require("../../exeptions/admin/api-error");
const { validateAccessToken } = require("../../services/tokenService");



function checkUserAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return next(AdminAPIError.UnauthorizedError());
        }

        const accessToken = authHeader.split(" ")[1];

        if(!accessToken) {
            return next(AdminAPIError.UnauthorizedError());
        }

        const userData = validateAccessToken(accessToken);

        if(!userData) {
            return next(AdminAPIError.UnauthorizedError());
        }

        req.user = userData;
        next();

    } catch(e){
        return next(AdminAPIError.UnauthorizedError());
    }
}



module.exports = {
    checkUserAuth
}