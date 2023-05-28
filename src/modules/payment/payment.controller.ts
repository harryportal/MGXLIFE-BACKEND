import { Request, Response } from "express";
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




}