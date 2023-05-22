"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const error_1 = require("./error");
const jwt_1 = require("../utils/jwtAuth/jwt");
const protect = (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        throw new error_1.AuthError('No Authentication Provided');
    }
    const [, token] = bearer.split(' '); // destructuring
    if (!token) {
        throw new error_1.AuthError('Bearer has no token');
    }
    const payload = (0, jwt_1.verifyJWT)(token);
    // This prevents the client from using the refresh token for authentication
    req.user = payload;
    next();
};
exports.protect = protect;
