const { isSpecialDate, isValidDate, loadLanguageFile } = require("../helpers");
const LanguagesModel = require("../models/language");
const { Op } = require("sequelize");


async function validateDates(req, res, next){

    const {
        languageCode = "uk_UA", 
        startDate = null, 
        endDate = null,
    } = req?.query;
    

    const lang = await LanguagesModel.findOne({
        where: {
            code: {
                [Op.eq]: languageCode
            }
        }
    });

    const isAlternativesRoute = req.originalUrl.includes("/alternatives");
    const error404Translations = isAlternativesRoute ? loadLanguageFile("_404-error-no-alternative-tickets.js", lang?.code) :  loadLanguageFile("404-error.js", lang?.code);


    if((isValidDate(new Date(startDate)) && isValidDate(new Date(endDate)))) {
        
        if(new Date(startDate) >= new Date(endDate)) {
            return res.status(404).render("error-404", {
                translations: error404Translations,
                isShowBtn: !isAlternativesRoute
            });
        }

        if(new Date(startDate) < new Date(new Date().toDateString())) {
            return res.status(404).render("error-404", {
                translations: error404Translations,
                isShowBtn: !isAlternativesRoute
            });
        }

        return next();

    } else {
        if(!isSpecialDate(endDate)) {
            return res.status(404).render("error-404", {
                translations: error404Translations,
                isShowBtn: !isAlternativesRoute
            });
        }

        return next();
    }
}

function checkIfBusFlightSelected(req, res, next){

    const {
        languageCode = "uk_UA", 
    } = req.query;

    if(req.session?.selectedBusFlight?.isSelected) {
        return next();
    }

    const error401Translations = loadLanguageFile("401-error.js", languageCode);
    return res.status(401).render("error-401", {translations: error401Translations, languageCode});  
}


module.exports = {
    validateDates,
    checkIfBusFlightSelected
}