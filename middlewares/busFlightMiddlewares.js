const { isSpecialDate, isValidDate, loadLanguageFile } = require("../helpers");
const LanguagesModel = require("../models/language");
const { Op } = require("sequelize");
const APIError = require("../exeptions/api-error");

async function validateDates(req, res, next){
    try {

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
                throw APIError.NotFoundError("not found", "error-404", {
                    translations: error404Translations,
                    isShowBtn: !isAlternativesRoute
                });
            }
    
            if(new Date(startDate) < new Date(new Date().toDateString())) {
                throw APIError.NotFoundError("not found", "error-404", {
                    translations: error404Translations,
                    isShowBtn: !isAlternativesRoute
                });
            }
    
            return next();
    
        } else {
            if(!isSpecialDate(endDate)) {
                throw APIError.NotFoundError("not found", "error-404", {
                    translations: error404Translations,
                    isShowBtn: !isAlternativesRoute
                });
            }
    
            return next();
        }
    } catch(err) {
        return next(err);
    }


}

function checkIfBusFlightSelected(req, res, next){
    try {
        const {
            languageCode = "uk_UA", 
        } = req.query;
    
        if(req.session?.selectedBusFlight?.isSelected) {
            return next();
        }
    
        const error401Translations = loadLanguageFile("401-error.js", languageCode);
    
        throw APIError.UnauthorizedError("unauthorized", "error-401", {translations: error401Translations, languageCode}); 
    } catch(err) {
        return next(err);
    }

}


module.exports = {
    validateDates,
    checkIfBusFlightSelected
}