class APIError extends Error {
    status;
    template;
    options;
    errors;

    constructor(status, message, template = "", options = {}, errors = []){
        super(message);
        this.status = status;
        this.template = template;
        this.options = options;
        this.errors = errors;
    }

    static BadRequest(message, errors = []){
        return new APIError(400, message, "", {}, errors);
    }

    static UnauthorizedError(message, template, options = {}){
        return new APIError(401, message, template, options);
    }

    static NotFoundError(message, template, options = {}){
        return new APIError(404, message, template, options);
    }

    static ValidationError(message, errors = []){
        return new APIError(422, message, "", {}, errors);
    }

}


module.exports = APIError;