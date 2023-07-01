import {Router} from "express";
import { protect } from "../../common/auth";
import PaymentController from "./payment.controller";
import container from "../../di/invesify.config";

export const paymentController = container.resolve<PaymentController>(PaymentController);

export const paymentRouter = Router();
paymentRouter.get("/subscription", protect, paymentController.createCheckoutSession)
paymentRouter.get("/customerportal", protect, paymentController.getCustomerPortal);

