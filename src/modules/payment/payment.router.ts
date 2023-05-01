import {Router} from "express";
import PaymentController from "./payment.controller"; 
import bodyParser from "body-parser";

const paymentRouter = Router();
paymentRouter.post("/webhook", bodyParser.raw({ type: 'application/json' }), PaymentController.eventHandler)



export default paymentRouter;