import { Response } from "express";
import PaymentRepository from "./payment.repository";
import { AuthRequest } from "../auth/auth.interface";

export default class PaymentController {
    private static paymentService = new PaymentRepository();

    static createCheckoutSession = async(req:AuthRequest, res:Response)=>{
        let {email} = req.user!;
        const checkouturl = await this.paymentService.createCheckOutSession(email);
        res.status(200).json({success:true, data: checkouturl})
    }

    static getCustomerPortal = async(req:AuthRequest, res:Response)=>{
        let {email} = req.user!;
        const portalSessionUrl = await this.paymentService.createPortalSession(email);
        res.status(200).json({success:true, data: portalSessionUrl})
    }

    static subscriptionWebhook = async(req:AuthRequest, res:Response)=>{
        let payload = req.body as Buffer;
        const signature = req.headers['stripe-signature'] as string;
        await this.paymentService.handleSubscriptionEvents(payload, signature)
        return res.status(200);
    }
    
}