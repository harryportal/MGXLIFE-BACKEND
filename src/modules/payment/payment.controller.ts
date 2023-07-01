import { Response } from "express";
import { AuthRequest } from "../auth/auth.dto";
import { IPaymentService, PTypes } from "./payment.dtos";
import { inject, injectable } from "inversify";

@injectable()
export default class PaymentController {
    private paymentService:IPaymentService;
    constructor(@inject(PTypes.IPaymentService)paymentService:IPaymentService){
        this.paymentService = paymentService;
    }

    public createCheckoutSession = async(req:AuthRequest, res:Response)=>{
        let {email} = req.user!;
        const checkouturl = await this.paymentService.createCheckOutSession(email);
        res.status(200).json({success:true, data: checkouturl})
    }

    public getCustomerPortal = async(req:AuthRequest, res:Response)=>{
        let {email} = req.user!;
        const portalSessionUrl = await this.paymentService.createPortalSession(email);
        res.status(200).json({success:true, data: portalSessionUrl.url})
    }

    public subscriptionWebhook = async(req:AuthRequest, res:Response)=>{
        let payload = req.body as Buffer;
        const signature = req.headers['stripe-signature'] as string;
        await this.paymentService.handleSubscriptionEvents(payload, signature)
        return res.status(200).json({success:true})
    }
    
}