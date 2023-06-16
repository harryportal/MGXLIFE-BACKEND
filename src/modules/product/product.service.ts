import { SingleProduct } from "./product.dtos";
import ProductRepository from "./product.repository";

export default class ProductService {
    private productRepository;

    constructor(){
        this.productRepository = new ProductRepository;
    }

    public addProduct = async(productData:SingleProduct):Promise<string | undefined>=>{
        // first check if the product does not exist already.
        const product = this.productRepository.getProduct(productData.productId);
        if(!product){
            const productId = await this.productRepository.addProduct(productData);
            return productId;
        };
        
        
    }



}