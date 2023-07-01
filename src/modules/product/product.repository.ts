import { PrismaClient, Product } from "@prisma/client";
import { IProductRepository, SingleProduct, updateProduct } from "./product.dtos";
import { inject, injectable } from "inversify";


@injectable()
export default class ProductRepository implements IProductRepository{
    private product;
    constructor(@inject(PrismaClient)prisma:PrismaClient){
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
      const productId = await this.product.create({
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