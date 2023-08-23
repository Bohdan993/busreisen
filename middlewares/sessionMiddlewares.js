const { loadLanguageFile } = require("../helpers");


function checkIfSessionIsStarted(req, res, next){

    const {
        language = "uk_UA", 
    } = req.session;
    
    if(req.session?.isStarted) {
        return next();
    }

    const error401Translations = loadLanguageFile("401-error.js", language);
    return res.status(401).render("error-401", {translations: error401Translations});  
}

module.exports = {
    checkIfSessionIsStarted
}