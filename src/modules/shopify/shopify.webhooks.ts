import { Request, Response } from "express"
import ShopifyService from "./shopify.service";
import { inject } from "inversify";
import { IShopifyService, STypes } from "./shopify.dtos";

export default class ShopifyWebhookController {
    private shopifyService;
    constructor(@inject(STypes.IShopifyService)shopifyService:IShopifyService){
        this.shopifyService = shopifyService;
    }

    public addSingleProduct= async(req:Request, res:Response)=>{
        const productData = req.body 
        await this.shopifyService.addSingleProduct(productData);
        return res.status(200).json({success:true});
    };

    public orderPayment = async(req:Request, res:Response)=>{
        const orderData = req.body;
        await this.shopifyService.proccessOrder(orderData);
        return res.status(200).json({success:true});
    }
}