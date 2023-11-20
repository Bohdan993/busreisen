function checkIfPassengersInfoExists(req, res, next){
    try {
        const {
            languageCode = "uk_UA", 
        } = req.query;

        const error401Translations = loadLanguageFile("401-error.js", languageCode);
        
        if(req.path === "/api/passengers") {
            if(req.query?.type === "check") {
                if(req.session?.passengersInfo) {
                    return next();
                }
                throw APIError.UnauthorizedError("unauthorized", "error-401", {translations: error401Translations, languageCode}); 
            }

            if(req.query?.type === "standart") {
                return next();
            }
        }

        if(req.session?.passengersInfo) {
            return next();
        }
    
        throw APIError.UnauthorizedError("unauthorized", "error-401", {translations: error401Translations, languageCode}); 
    } catch(err) {
        return next(err);
    }

}


module.exports = {
    checkIfPassengersInfoExists
}