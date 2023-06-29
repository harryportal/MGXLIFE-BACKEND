import logger from "../../utils/logging/winston";
import { SingleProduct } from "../product/product.dtos";
import ProductService from "../product/product.service";
import Product, { LineItem, Order, ProductCommission } from "./shopify.dtos";
import DistributorRepository from "../distributor/distributor.repository";
import ProductRepository from "../product/product.repository";
import { AddOrder } from "../order/order.dtos";
import { OrderRepository } from "../order/order.repository";


export default class ShopifyService {
    private productService= new ProductService();
    private distributorRepository = new DistributorRepository();
    private productRepository = new ProductRepository();
    private orderRepository =  new OrderRepository();

    private findAndUpdateDistributorCommission = async(refferingId:string, orderData:Order)=>{
        const distributor = await this.distributorRepository.getDistributorwithReferralId(refferingId);
        if(distributor && distributor.subscriptionStatus){
            // update the distributor's commission for each of the products line items
            for(const productData of orderData.line_items){
                const commission = await this.calculateCommission(productData);
                await this.distributorRepository.updateDistributorCommission(distributor.id, commission);
            }
        }
        /* More logic should come in here:
        1. Calculate the correct commission
        2 Update the commmission of the distributor and the parent distributors
        */

    }

    private calculateCommission = async (orderCommissionDetails: ProductCommission) => {
        const { product_id, quantity } = orderCommissionDetails;
        let product = await this.productRepository.getProduct(String(product_id));
        
        const bonusType = product!.bonusType;
        const bonusAmount = product!.bonusAmount;
        let commission: number;
        // check if product is percentage or flat rate based
        // use product!.bonus type and product!.bonus amount instead of just 20
        if (bonusType == "PERCENTAGE") {
          commission = product!.price * (bonusAmount / 100) * quantity;
        } else {
          commission = bonusAmount * quantity;
        }
      
        return commission;
      }

    private addVolumeCredit = async ()=>{
        
    }

    
      
    // new function for parent affiliate.
    private calculateOrderAmountandQuantity = (lineItems:LineItem[])=>{
        let amount:number = 0.0;
        let quantity:number = 0;
        for(const orderLineItem of lineItems){
            amount += Number(orderLineItem.price);
            quantity += orderLineItem.quantity;
        }
        return {amount, quantity};

    }

    private checkOrder = async(shopifyId:string)=>{
        // This check with a shopify Id if an order already exists
        const order = await this.orderRepository.getOrder(shopifyId);
        return order
    }

    public proccessOrder = async(orderData:Order)=>{
        /* This would first verify the webhook is from shopify 
        extract the relevant information from the webhook, then send the product data to the produt repository*/
        // We should even try to verify that the webhook has not been sent before due to issues with shopify
        console.log(orderData);
        const orderId = String(orderData.id);
        const checkOrder = await this.checkOrder(orderId);

        if(!checkOrder){
            const refferingId = orderData.landing_site_ref ?? null;
            //check if a buyer is a distributor=db for email
            //sponsoring distributor gets 20% of the price after promo code.
            if(refferingId){
                await this.findAndUpdateDistributorCommission(refferingId, orderData);

            };

            const {order_number, line_items} = orderData;
            const {first_name, last_name, email } = orderData.customer;
            const {amount, quantity} = this.calculateOrderAmountandQuantity(line_items);
            // Simply update the Order DB for the admin client!
            const order:AddOrder = { shopifyId:orderId, orderNumber:order_number, customerEmail:email,
                amountPaid:amount, quantity, customerFirstName:first_name, customerLastName:last_name,
                distributorId:refferingId };
            const createOrder = await this.orderRepository.addOrder(order);
            logger.info(`An Order with ID ${createOrder.id} has been added`);
        }
    }
    
    public addSingleProduct = async(product:Product)=>{
        const productObject = this.retrieveProductData(product);
        const productId = await this.productService.addProduct(productObject);
        this.logProductInfo(productId);
    }

    private logProductInfo = (productId:string|undefined)=>{
        if(productId){
            logger.info("A new Shopify Product Added with Id", productId)
        }else{
            logger.error("Duplicate webhook sent! for Product Id")
        }
    }

    private retrieveProductData = (product:Product):SingleProduct=>{
        const price = parseFloat(product.variants[0]. price);
        const image = product.image.src;
        const productId = String(product.id);
        const title = product.title;
        const productObject:SingleProduct = {productId, title, image, price};
        return productObject;
    };

}