import logger from "../../utils/logging/winston";
import { IProductService, PdTypes, SingleProduct } from "../product/product.interface";
import { Product as ShopifyProduct, IShopifyService, LineItem, Order, ProductCommission } from "./shopify.dtos";
import { AddOrder, IOrderRepository, OTypes } from "../order/order.dtos";
import { inject, injectable } from "inversify";
import { Types as DTypes, IDistributorRepository } from "../distributor/distributor.interface";
import { Distributor, Product } from "@prisma/client";

@injectable()
export default class ShopifyService implements IShopifyService{
    constructor(@inject(OTypes.IOrderRepository)private readonly orderRepository:IOrderRepository, 
    @inject(DTypes.IDistributorRepository)private readonly distributorRepository:IDistributorRepository, 
    @inject(PdTypes.IProductService)private readonly productService:IProductService){}

    private findAndUpdateDistributorCommission = async(refferingId:string, orderData:Order)=>{
        const distributor = await this.distributorRepository.getDistributorwithReferralId(refferingId);
        if(distributor && distributor.subscriptionStatus == "PAID"){
            // update the distributor's commission for each of the products line items
            // get the total amount from the order and update the sponsoring distributor's vplume credit
            const {amount} = this.calculateOrderAmountandQuantity(orderData.line_items);
            for(const productData of orderData.line_items){
                const commission = await this.calculateCommission(productData);
                await this.distributorRepository.updateDistributorCommission(distributor.id, commission, amount);
            }
            await this.distributorRepository.addVolumeToAllUplines(distributor.referredById, amount);
        }
    }

    /**
     * Calculates the commission for a single product based on the bonsy Type/Amount and quantity ordered
     * @param orderCommissionDetails 
     * @returns 
     */
    private calculateCommission = async (orderCommissionDetails: ProductCommission)=>{
        const { product_id, quantity } = orderCommissionDetails;
        const product = await this.productService.getProduct(String(product_id)) as Product;
        const bonusType = product!.bonusType;
        const bonusAmount = product!.bonusAmount;
        let commission: number;
        if (bonusType == "PERCENTAGE") {
          commission = product!.price * (bonusAmount / 100) * quantity;
        } else { commission = bonusAmount * quantity;  }
        return commission;
    }

    
    /**
     * Returns the total quantity and amount for the entire order
     * @param lineItems
     */
    private calculateOrderAmountandQuantity = (lineItems:LineItem[])=>{
        let amount:number = 0.0;
        let quantity:number = 0;
        for(const orderLineItem of lineItems){
            amount += Number(orderLineItem.price);
            quantity += orderLineItem.quantity;
        }
        return {amount, quantity};
    }

    
    /**
     * 1. Verify the stripe webhook Signature - come back to this 
     * 2. Take the following steps if refferal Id exists in the payload
     * 3. Check if the refferal Id exists in database -  done
     * 4. If true, calculate the product's commision and add to the normal distributor done
     * 5. Calcualate the Volume Credit and add to the Sponsoring distributor(If any) - i.e the distributor
     * 6. that reffered the current distributor.
     * 7. Take the following steps if there is no reffering Id in the payload - This should come first sef
     * 8. Extract the customer email and check if there is a distributor with that email address
     * 9. If true, add 20% of the product's price as bonus for the distributor and add 20% of what is left on the price
     *  to the sponsoring distributor commission
     * @param orderData 
     */
    public proccessOrder = async(orderData:Order)=>{
        const orderId = String(orderData.id);
        const checkOrder = await this.orderRepository.getOrder(orderId);

        if(!checkOrder){
            // Check the email that is attached and see if it's a distributor
            const customerEmail = orderData.customer.email;
            const refferingId = orderData.landing_site_ref ?? null;
            const distributor = await this.distributorRepository.getDistributor(customerEmail);
            if(distributor){
                await this.processDistributorCommission(distributor,orderData);
            }else if(refferingId){
                await this.findAndUpdateDistributorCommission(refferingId, orderData);
            };
            await this.proccessOrderData(orderData, orderId, refferingId)
        }
    }

    private proccessOrderData = async(orderData:Order, orderId:string, refferingId:string)=>{
        const {order_number, line_items} = orderData;
            const {first_name, last_name, email } = orderData.customer;
            const {amount, quantity} = this.calculateOrderAmountandQuantity(line_items);
            const createdAt = new Date().toLocaleString();
            
            const order:AddOrder = { shopifyId:orderId, orderNumber:order_number, customerEmail:email,
                amountPaid:amount, quantity, customerFirstName:first_name, customerLastName:last_name,
                distributorId:refferingId, createdAt };
            const createOrder = await this.orderRepository.addOrder(order);
            logger.info(`An Order with ID ${createOrder.id} has been added`);
    }
    
    private processDistributorCommission = async(distributor:Distributor, orderData:Order)=>{
        const {amount} = this.calculateOrderAmountandQuantity(orderData.line_items);
        const interest = ((20/100) * amount)/ 100;
        await this.distributorRepository.updateDistributorCommission(distributor.id, interest, 0);
        // Add 20% of the amount left to the commission of the sponsoring distributor
        if(distributor.referredById){
            const sponsoringId = distributor.referredById;
            const sponsoringInterest = ((20/100 * (80/100 *  amount)))/100;
            await this.distributorRepository.updateDistributorCommission(sponsoringId, sponsoringInterest, 0);
        }
    }
    
    public addSingleProduct = async(product:ShopifyProduct)=>{
        console.log(product)
        const productObject = this.retrieveProductData(product);
        console.log(productObject)
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

    private retrieveProductData = (product:ShopifyProduct):SingleProduct=>{
        const price = parseFloat(product.variants[0].price);
        const image = product.image?.src ?? "";
        const productId = String(product.id);
        const title = product.title;
        const productObject:SingleProduct = {productId, title, image, price};
        return productObject;
    };

}