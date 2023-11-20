const APIError = require("../exeptions/api-error");

function checkIfTicketNotCreated(req, res, next) {
    try {

        if(!(req.session?.ticketCreated)) {
            return next();
        }
    
        throw APIError.BadRequest("ticket already created");
    } catch(err) {
        return next(err);
    }

}

module.exports = {
    checkIfTicketNotCreated
}