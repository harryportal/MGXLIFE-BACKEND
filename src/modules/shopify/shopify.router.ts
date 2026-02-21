import {Router} from "express";
import ShopifyWebhookController from "./shopify.webhooks";
import container from "../../di/invesify.config";

const shopifywebhookRouter = Router();

const shopifyWebhookController = container.resolve<ShopifyWebhookController>(ShopifyWebhookController);

shopifywebhookRouter.post("/webhook/product-creation", shopifyWebhookController.addSingleProduct);
shopifywebhookRouter.post("/webhook/order-payment", shopifyWebhookController.orderPayment)

export default shopifywebhookRouter;
