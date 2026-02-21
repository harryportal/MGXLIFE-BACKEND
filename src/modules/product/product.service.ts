import { inject, injectable } from "inversify";
import { BadRequestError } from "../../common/error";
import IPagination from "../../utils/pagination/pagination.interface";
import { IProductRepository, IProductService, PdTypes, SingleProduct, updateProduct } from "./product.interface";
import { BonusType, Product } from "@prisma/client";

@injectable()
export default class ProductService implements IProductService{
    constructor(@inject(PdTypes.IProductRepository)private readonly productRepository:IProductRepository){}

    public addProduct = async(productData:SingleProduct):Promise<string | undefined>=>{
        // first check if the product does not exist already.
        const product = await this.productRepository.getProduct(productData.productId);
        console.log(product)
        if(!product){
            const productId = await this.productRepository.addProduct(productData);
            return productId;
        };
    }

    public getProduct = async(shopifyId:string):Promise<Product>=>{
        const product = await this.productRepository.getProduct(shopifyId);
        return product as Product;
    }

    public getAllProducts = async(paginationObject:IPagination)=>{
        const {take, skip} = paginationObject;
        const products = await this.productRepository.getAllProducts(take, skip);
        return products;
    }

    public updateProduct = async(productData:updateProduct, shopifyId:string)=>{
        const product = await this.productRepository.getProduct(shopifyId);
        if(!product){ throw new BadRequestError("No Product with Shopify Id found!") };
        const updatedProduct = await this.productRepository.updateProduct(productData, shopifyId);
        return updatedProduct;
    }



}