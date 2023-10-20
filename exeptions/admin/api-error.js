class AdminAPIError extends Error {
    status;
    errors;

    constructor(status, message, errors = []){
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(){
        return new AdminAPIError(401, "Користувач не авторизований");
    }

    static BadRequest(message, errors = []){
        return new AdminAPIError(400, message, errors);
    }
}


module.exports = AdminAPIError;