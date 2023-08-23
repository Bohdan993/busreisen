const { isSpecialDate, isValidDate, loadLanguageFile } = require("../helpers");
const LanguagesModel = require("../models/language");
const { Op } = require("sequelize");


async function validateDates(req, res, next){

    const {
        languageCode = "uk_UA", 
        startDate = null, 
        endDate = null
    } = req?.query;
    

    const lang = await LanguagesModel.findOne({
        where: {
            code: {
                [Op.eq]: languageCode
            }
        }
    });

    const error404Translations = loadLanguageFile("404-error.js", lang?.code);


    if((isValidDate(new Date(startDate)) && isValidDate(new Date(endDate)))) {
        
        if(new Date(startDate) > new Date(endDate)) {
            return res.status(404).render("error-404", {translations: error404Translations});
        }

        if(new Date(startDate) < new Date(new Date().toDateString())) {
            return res.status(404).render("error-404", {translations: error404Translations});
        }
        return next();

    } else {
        if(!isSpecialDate(endDate)) {
            return res.status(404).render("error-404", {translations: error404Translations});
        }

        return next();
    }
}


module.exports = {
    validateDates
}