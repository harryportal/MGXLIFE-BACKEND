import {Router} from "express";
import ShopifyWebhookController from "./shopify.webhooks";

const shopifywebhookRouter = Router();

shopifywebhookRouter.post("/webhook/product-creation", ShopifyWebhookController.addSingleProduct);
shopifywebhookRouter.post("/webhook/order-payment", ShopifyWebhookController.orderPayment)

export default shopifywebhookRouter;
