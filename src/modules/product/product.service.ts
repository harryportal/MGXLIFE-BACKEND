import { BadRequestError } from "../../common/error";
import IPagination from "../../utils/pagination/pagination.interface";
import { SingleProduct, updateProduct } from "./product.dtos";
import ProductRepository from "./product.repository";

export default class ProductService {
    private productRepository;

    constructor(){
        this.productRepository = new ProductRepository;
    }

    public addProduct = async(productData:SingleProduct):Promise<string | undefined>=>{
        // first check if the product does not exist already.
        const product = await this.productRepository.getProduct(productData.productId);
        if(!product){
            const productId = await this.productRepository.addProduct(productData);
            return productId;
        };
    }

    public getAllProducts = async(paginationObject:IPagination)=>{
        const {take, skip} = paginationObject;
        const products = await this.productRepository.getAllProduct(take, skip);
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