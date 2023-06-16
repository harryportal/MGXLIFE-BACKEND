import { Request, Response } from "express"
import ShopifyService from "./shopify.service";

export default class ShopifyWebhookController {
    private static shopifyService = new ShopifyService();

    static addSingleProduct= async(req:Request, res:Response)=>{
        const productData = req.body 
        await this.shopifyService.addSingleProduct(productData);
        return res.status(200);
    };

    static addMultipleProducts= async(req:Request, res:Response)=>{
        const productData = req.body 
        await this.shopifyService.addMultipleProduct(productData);
        return res.status(200);
    };

}