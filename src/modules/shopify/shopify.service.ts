import logger from "../../utils/logging/winston";
import { SingleProduct } from "../product/product.dtos";
import ProductService from "../product/product.service";
import Product from "./shopify.dtos";

export default class ShopifyService {
    private productService= new ProductService();

    public addMultipleProduct = async(productData:Product[])=>{
        /* This would first verify the webhook is from shopify 
        extract the relevant information from the webhook, then send the product data to the produt repository*/
        for(const product of productData){
            const productObject = this.retrieveProductData(product);
            const productId = await this.productService.addProduct(productObject);
            this.logProductInfo(productId)
        }
    }

    public addSingleProduct = async(product:Product)=>{
        const productObject = this.retrieveProductData(product);
        const productId = await this.productService.addProduct(productObject);
        this.logProductInfo(productId)
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
    }

    
      
    }