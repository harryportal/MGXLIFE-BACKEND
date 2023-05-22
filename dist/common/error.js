"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.InternalServerError = exports.BadRequestError = exports.NotAuthorizedError = exports.AuthError = exports.NotFoundError = exports.ErrorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode, rawErrors) {
        super(message);
        this.statusCode = statusCode;
        this.rawErrors = rawErrors;
        Error.captureStackTrace(this, this.constructor); // captures errors from every part of the application
    }
}
exports.ApiError = ApiError;
class ErrorHandler {
    static handle() {
        return (err, req, res, next) => {
            var _a;
            const statusCode = err.statusCode || 500;
            let errorStack = {};
            if (process.env.NODE_ENV == 'development') {
                errorStack = { stack: err.stack };
            }
            res.status(statusCode).json({
                message: err.message,
                success: false,
                errorStack,
                rawErrors: (_a = err.rawErrors) !== null && _a !== void 0 ? _a : [],
            });
        };
    }
    static pagenotFound() {
        return (req, res, next) => {
            throw new NotFoundError(req.path);
        };
    }
    static exceptionRejectionHandler() {
        process.on('unhandledRejection', (reason, promise) => {
            console.log(reason.name, reason.message);
            console.log('UNHANDLED REJECTION!.. Shutting down Server');
            throw reason;
        });
        process.on('uncaughtException', (err) => {
            console.log(err.name, err.message);
            console.log('UNCAUGHT EXCEPTION!');
            process.exit(1);
        });
    }
}
exports.ErrorHandler = ErrorHandler;
class NotFoundError extends ApiError {
    constructor(path) {
        super(`Requested Path ${path} is not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class AuthError extends ApiError {
    constructor(message) {
        super(message, 401);
    }
}
exports.AuthError = AuthError;
class NotAuthorizedError extends ApiError {
    constructor(message = "Not Authorized!") {
        super(message, 403);
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
class BadRequestError extends ApiError {
    constructor(message, errors) {
        super(message, 400, errors);
        this.message = message;
        this.errors = errors;
    }
}
exports.BadRequestError = BadRequestError;
class InternalServerError extends ApiError {
    constructor(errors) {
        super("Internal Server Error", 500, errors);
        this.errors = errors;
    }
}
exports.InternalServerError = InternalServerError;
class ConflictError extends ApiError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
