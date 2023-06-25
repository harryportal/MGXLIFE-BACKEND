import { Request, Response } from "express"
import ShopifyService from "./shopify.service";
import { OrderRepository } from "../order/order.repository";

export default class ShopifyWebhookController {
    private static shopifyService = new ShopifyService();
    private static orderService =  new OrderRepository();

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

    static orderPayment = async(req:Request, res:Response)=>{
        const orderData = req.body;
        await this.shopifyService.proccessOrder(orderData);
        return res.status(200);
    }

    static getAllOrders = async(req:Request, res:Response)=>{
        const orders = await this.orderService.getAllOrders();
        return res.status(200).json({data:orders});
    }

}