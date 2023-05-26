import {Router} from "express";
import { protect } from "../../common/auth";
import PaymentController from "./payment.controller";

const paymentRouter = Router();
//paymentRouter.post("/webhook", express.raw({ type: 'application/json' }),)// PaymentController.eventHandler)
paymentRouter.post("/subscription", protect, PaymentController.createCheckoutSession)


export default paymentRouter;