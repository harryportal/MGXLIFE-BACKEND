"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import PaymentController from "./payment.controller"; 
const body_parser_1 = __importDefault(require("body-parser"));
const paymentRouter = (0, express_1.Router)();
paymentRouter.post("/webhook", body_parser_1.default.raw({ type: 'application/json' })); // PaymentController.eventHandler)
exports.default = paymentRouter;
