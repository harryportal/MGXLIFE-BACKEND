import express from "express";
import morgan from 'morgan';
import cors from 'cors';
import { ErrorHandler } from './common/error';
import { Application } from 'express';
import authRouter from "./modules/auth/auth.router";
import userRouter from "./modules/user/user.router";
import listingRouter from "./modules/lisiting/lisiting.router";
import paymentRouter from "./modules/payment/payment.router";

const app: Application = express();

app.use(cors());
app.use(morgan('dev'));

/* Placing the payment webhook router above the body parser to overide 
.json and .raw instead for buffer */
app.use("/payment", paymentRouter) 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/listing", listingRouter)


app.use('*', ErrorHandler.pagenotFound());
app.use(ErrorHandler.handle());
ErrorHandler.exceptionRejectionHandler();

export default app;
