import { Response } from "express";
import { AuthRequest } from "../auth/auth.dto";
import { IPaymentService, PTypes } from "./payment.interface";
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

     public createConnectedAccount = async(req:AuthRequest, res:Response)=>{
        const email = req.user!.email;
        const loginLink = await this.paymentService.getAccountOnboardingLink(email);
        return res.status(200).json({success:true, data:loginLink});
    }
    
    public getAccountLoginLink = async(req:AuthRequest, res:Response)=>{
        const email = req.user!.email;
        const link = await this.paymentService.getConnectedAccountLoginLink(email);
        return res.status(200).json({success:true, data:link});
    }

    public stripeWebhookHandler = async(req:AuthRequest, res:Response)=>{
        let payload = req.body as Buffer;
        const signature = req.headers['stripe-signature'] as string;
        await this.paymentService.handleSubscriptionEvents(payload, signature)
        return res.status(200).json({success:true})
    }

}