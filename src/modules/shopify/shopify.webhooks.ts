import { Request, Response } from "express"
import ShopifyService from "./shopify.service";

export default class ShopifyWebhookController {
    private static shopifyService = new ShopifyService();

    static addSingleproduct= async(req:Request, res:Response)=>{
        const productData = req.body 
        const product = await this.shopifyService.addSingleProduct(productData);
        return res.status(200);
    };
}