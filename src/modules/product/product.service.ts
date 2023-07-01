import { inject, injectable } from "inversify";
import { BadRequestError } from "../../common/error";
import IPagination from "../../utils/pagination/pagination.interface";
import { IProductRepository, IProductService, PdTypes, SingleProduct, updateProduct } from "./product.dtos";
import { Product } from "@prisma/client";

@injectable()
export default class ProductService implements IProductService{
    private productRepository:IProductRepository;
    constructor(@inject(PdTypes.IProductRepository)productRepository:IProductRepository){
        this.productRepository = productRepository;
    }

    public addProduct = async(productData:SingleProduct):Promise<string | undefined>=>{
        // first check if the product does not exist already.
        const product = await this.productRepository.getProduct(productData.productId);
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

    public updateProduct = async(productData:updateProduct, productId:string)=>{
        const product = await this.productRepository.getProduct(productId);
        if(!product){ throw new BadRequestError("No Product with Id found!"); }
        const {bonusAmount} = productData;
        // An Extra check for the client!
        if(bonusAmount > product.price){
            throw new BadRequestError("Product Bonus Amount can not be more than half of product Price")
        }
        const updatedProduct = await this.productRepository.updateProduct(productData, productId);
        return updatedProduct;
    }



}