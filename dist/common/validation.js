"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const error_1 = require("./error");
const winston_1 = __importDefault(require("../utils/logging/winston"));
// a middleware to validate the user input
class RequestValidator {
}
exports.default = RequestValidator;
_a = RequestValidator;
RequestValidator.validate = (classInstance) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const objectClass = (0, class_transformer_1.plainToClass)(classInstance, req.body);
        yield (0, class_validator_1.validate)(objectClass).then((errors) => {
            var _b;
            if (errors.length > 0) {
                let rawErrors = [];
                for (const error of errors) {
                    rawErrors = rawErrors.concat(...rawErrors, Object.values((_b = error.constraints) !== null && _b !== void 0 ? _b : []));
                }
                winston_1.default.error(rawErrors);
                next(new error_1.BadRequestError('Input validation failed!', rawErrors));
            }
        });
        next();
    });
};
