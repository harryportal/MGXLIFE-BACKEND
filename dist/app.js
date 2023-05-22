"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const error_1 = require("./common/error");
const auth_router_1 = __importDefault(require("./modules/auth/auth.router"));
const payment_router_1 = __importDefault(require("./modules/payment/payment.router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
/* Placing the payment webhook router above the body parser to overide
.json and .raw instead for buffer */
app.use("/payment", payment_router_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/auth", auth_router_1.default);
app.use('*', error_1.ErrorHandler.pagenotFound());
app.use(error_1.ErrorHandler.handle());
error_1.ErrorHandler.exceptionRejectionHandler();
exports.default = app;
