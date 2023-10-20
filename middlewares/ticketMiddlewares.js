const APIError = require("../exeptions/api-error");

function checkIfTicketCreated(req, res, next) {
    
    try {
        const {
            languageCode = "uk_UA", 
        } = req.query;
    
        if(!(req.session?.ticketCreated)) {
            return next();
        }
    
        throw APIError.BadRequest("ticket already created");
    } catch(err) {
        return next(err);
    }

}

module.exports = {
    checkIfTicketCreated
}