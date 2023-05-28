import {Router} from "express";
import { protect } from "../../common/auth";
import PaymentController from "./payment.controller";

const paymentRouter = Router();
//paymentRouter.post("/webhook", express.raw({ type: 'application/json' }),)// PaymentController.eventHandler)
paymentRouter.get("/subscription", protect, PaymentController.createCheckoutSession)
paymentRouter.get("/customerportal", protect, PaymentController.getCustomerPortal);

export default paymentRouter;