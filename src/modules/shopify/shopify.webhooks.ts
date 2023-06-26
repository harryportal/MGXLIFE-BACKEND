import { Request, Response } from "express"
import ShopifyService from "./shopify.service";

export default class ShopifyWebhookController {
    private static shopifyService = new ShopifyService();

    static addSingleProduct= async(req:Request, res:Response)=>{
        const productData = req.body 
        await this.shopifyService.addSingleProduct(productData);
        return res.status(200).json({success:true});
    };

    static orderPayment = async(req:Request, res:Response)=>{
        const orderData = req.body;
        await this.shopifyService.proccessOrder(orderData);
        return res.status(200).json({success:true});
    }
}