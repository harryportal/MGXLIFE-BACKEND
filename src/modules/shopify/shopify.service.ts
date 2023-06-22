import { Distributor } from "@prisma/client";
import logger from "../../utils/logging/winston";
import { SingleProduct } from "../product/product.dtos";
import ProductService from "../product/product.service";
import Product, { Order, ProductCommission } from "./shopify.dtos";
import DistributorRepository from "../distributor/distributor.repository";
import ProductRepository from "../product/product.repository";


export default class ShopifyService {
    private productService= new ProductService();
    private distributorRepository = new DistributorRepository();
    private productRepository = new ProductRepository();

    public addMultipleProduct = async(productData:Product[])=>{
        /* This would first verify the webhook is from shopify 
        extract the relevant information from the webhook, then send the product data to the produt repository*/
        for(const product of productData){
            const productObject = this.retrieveProductData(product);
            const productId = await this.productService.addProduct(productObject);
            this.logProductInfo(productId);
        }
    }


    private findAndUpdateDistributorCommission = async(refferingId:string, orderData:Order)=>{
        const distributor = await this.distributorRepository.getDistributorwithReferralId(refferingId);
        if(distributor){
            // update the distributor's commission for each of the products line items
            for(const productData of orderData.line_items){
                const {price, quantity, } = productData;
            }

        }

    }

    private calculateCommission = async(orderCommissionDetails:ProductCommission)=>{
        const {price, product_id, quantity} = orderCommissionDetails;
        const product = await this.productRepository.getProduct(String(product_id));
        // calculate 
    }

    
    public addOrder = async(orderData:Order)=>{
        /* This would first verify the webhook is from shopify 
        extract the relevant information from the webhook, then send the product data to the produt repository*/
        const refferingId = orderData.landing_site_ref;
        let distributor:Distributor | null;
        if(refferingId){
            await this.findAndUpdateDistributorCommission(refferingId, orderData)
        };

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
        const productId = product.id.toString();
        const title = product.title;
        const productObject:SingleProduct = {productId, title, image, price};
        return productObject;
    };

}