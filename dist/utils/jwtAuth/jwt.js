"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.createVerificationToken = exports.createRefreshToken = exports.createAcessToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../../common/error");
const error_2 = require("../../common/error");
const hashPassword = (password) => {
    return bcrypt.hash(password, 5);
};
exports.hashPassword = hashPassword;
const comparePassword = (password, hash) => {
    return bcrypt.compare(password, hash);
};
exports.comparePassword = comparePassword;
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new error_1.InternalServerError("JWT SECRET HAS NO VALUE!");
}
const createAcessToken = (user) => {
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        type: "access" }, secret, { expiresIn: process.env.JWT_EXPIRATION_TIME });
    return token;
};
exports.createAcessToken = createAcessToken;
const createRefreshToken = (user) => {
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, type: "refresh" }, secret, {
        expiresIn: process.env.REFRESHTOKEN_EXPIRATION_TIME,
    });
    return token;
};
exports.createRefreshToken = createRefreshToken;
const createVerificationToken = (email) => {
    const token = jsonwebtoken_1.default.sign({ email, type: "verify" }, secret);
    return token;
};
exports.createVerificationToken = createVerificationToken;
const verifyJWT = (token) => {
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        return payload;
    }
    catch (e) {
        throw new error_2.AuthError('Invalid Token Provided');
    }
};
exports.verifyJWT = verifyJWT;
