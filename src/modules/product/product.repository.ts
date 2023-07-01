import { Product } from "@prisma/client";
import { prisma } from "../../utils/db/prisma";
import { IProductRepository, SingleProduct, updateProduct } from "./product.dtos";


export default class ProductRepository implements IProductRepository{
    private product;
    constructor(){
        this.product = prisma.product;
    }

    public getProduct = async(shopifyId:string):Promise<Product | null>=>{
        const product = await this.product.findUnique({
          where: {
            productId: shopifyId
          }});
        return product;
    }
    
    public getAllProducts = async(take:number, skip:number):Promise<Product[]>=>{
      const products = await this.product.findMany({ take, skip  });
      return products;
    }

    public addProduct = async(productData:SingleProduct):Promise<string>=>{
      const productId = await prisma.product.create({
            data: { ...productData },
            select:{ id: true }
        });
      return productId.id;
    }

    public updateProduct = async(productData:updateProduct, productId:string):Promise<Product>=>{
        // reserverd for the admin to only update the the product bonus amount and bonus type
        const {bonusAmount, bonusType} = productData;
        const updatedProduct = await this.product.update({
          where:{ id: productId}, 
          data:{ 
            bonusAmount, bonusType
          }
        });
        return updatedProduct;
    }

}