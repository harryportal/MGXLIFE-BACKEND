import { Product } from "@prisma/client";
import { prisma } from "../../utils/db/prisma";
import { SingleProduct } from "./product.dtos";

export default class ProductRepository{
    private product;
    constructor(){
        this.product = prisma.product;
    }

    public getProduct = async(shopifyId:string):Promise<Product | null>=>{
        const product = await this.product.findUnique({
          where: {
            productId: shopifyId
          }
        });
        return product;
    }

    public addProduct = async(productData:SingleProduct):Promise<string>=>{
      const product =  await prisma.product.create({
            data: { ...productData  },
        });
      return product.id;
    }

}