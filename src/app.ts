import express from "express";
import morgan from 'morgan';
import cors from 'cors';
import { ErrorHandler } from './common/error';
import { Application } from 'express';
import authRouter from "./modules/auth/auth.router";
import {paymentRouter, paymentController }from "./modules/payment/payment.router";
import distributorRouter from "./modules/distributor/distributor.router";
import shopifywebhookRouter from "./modules/shopify/shopify.router";
import adminRouter from "./modules/admin/admin.router";

const app: Application = express();

app.use(cors());
app.use(morgan('dev'));

/* Placing the payment webhook router above the body parser to overide 
.json and .raw instead for buffer 
todo: seperate the webhook controller into a different module or define seperate routers for them 
*/
app.post("/subscription/webhook", express.raw({ type: 'application/json' }), paymentController.subscriptionWebhook)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/shopify", shopifywebhookRouter);
app.use("/payment", paymentRouter);
app.use("/admin", adminRouter);
app.use("/distributor", distributorRouter);
app.use("/auth", authRouter);



app.use('*', ErrorHandler.pagenotFound());
app.use(ErrorHandler.handle());
ErrorHandler.exceptionRejectionHandler();

export default app;
