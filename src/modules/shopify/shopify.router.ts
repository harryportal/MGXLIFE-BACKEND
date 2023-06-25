import {Router} from "express";
import ShopifyWebhookController from "./shopify.webhooks";

const shopifywebhookRouter = Router();

shopifywebhookRouter.post("/webhook/product-creation", ShopifyWebhookController.addSingleProduct);
shopifywebhookRouter.post("/webhook/multipleproduct-creation", ShopifyWebhookController.addMultipleProducts);
shopifywebhookRouter.post("/webhook/order-payment", ShopifyWebhookController.orderPayment)
shopifywebhookRouter.get("/orders", ShopifyWebhookController.getAllOrders)

export default shopifywebhookRouter;