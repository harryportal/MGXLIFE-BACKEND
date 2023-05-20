import { Request, Response } from "express"
import ShopifyService from "./shopify.service";

export default class ShopifyWebhook {
    private shopifyService;
    constructor(){
        this.shopifyService =  new ShopifyService();
    }
    static productCreation = async(req:Request, res:Response)=>{
        //await this.shopifyService.
    }

}