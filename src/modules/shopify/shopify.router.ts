import {Router} from "express";
import ShopifyWebhookController from "./shopify.webhooks";

const shopifywebhookRouter = Router();

shopifywebhookRouter.post("/webhook/product-creation", ShopifyWebhookController.addSingleproduct);


export default shopifywebhookRouter;