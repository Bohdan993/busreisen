const { loadLanguageFile } = require("../helpers");


function checkIfSessionIsStarted(req, res, next) {

    const {
        languageCode = "uk_UA", 
    } = req.query;
    
    if(req.session?.isStarted) {
        return next();
    }

    const error401Translations = loadLanguageFile("401-error.js", languageCode);
    return res.status(401).render("error-401", {translations: error401Translations, languageCode});  
}

function checkIfSessionIsFinished(req, res, next) {
    
    const {
        languageCode = "uk_UA", 
    } = req.query;

    if(!(req.session?.isFinished)) {
        return next();
    }

    const error401Translations = loadLanguageFile("401-error.js", languageCode);
    return res.status(401).render("error-401", {translations: error401Translations, languageCode});  
}

module.exports = {
    checkIfSessionIsStarted,
    checkIfSessionIsFinished
}