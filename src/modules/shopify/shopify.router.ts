import {Router, Request, Response} from "express";
import ShopifyWebhookController from "./shopify.webhooks";

const shopifywebhookRouter = Router();

shopifywebhookRouter.post("/webhook/product-creation", ShopifyWebhookController.addSingleProduct);
shopifywebhookRouter.post("/webhook/multipleproduct-creation", ShopifyWebhookController.addMultipleProducts);
shopifywebhookRouter.post("/webhook/order-creation", (req:Request, res:Response)=>{
    console.log(req.body);
    return res.status(200);
})

export default shopifywebhookRouter;