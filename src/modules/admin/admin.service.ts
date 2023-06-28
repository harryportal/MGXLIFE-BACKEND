import current_page from "../../utils/pagination/page";
import DistributorRepository from "../distributor/distributor.repository";
import { OrderRepository } from "../order/order.repository";
import ProductRepository from "../product/product.repository";

export default class AdminService {
    private orderRepository = new OrderRepository();
    private productRepository = new ProductRepository();
    private distributorRepository = new DistributorRepository()

    public signIn = async(email:string, password:string)=>{

    }

    public getAdminorThrow = async(email:string)=>{


    }

    public getAllProducts = async(pageNumber:string)=>{
        const paginationObject = current_page(pageNumber); 
        const products = await this.productRepository.getAllProduct(paginationObject);
        return products;
    }

    public getAllDistributors = async(pageNumber:string)=>{
        const paginationObject = current_page(pageNumber);
        const distributors = await this.distributorRepository.getAllDistributors(paginationObject);
        return distributors;
    }

    public getAllOrders = async(pageNumber:string)=>{
        const paginationObject = current_page(pageNumber);
        const orders = await this.orderRepository.getAllOrders(paginationObject);
        return orders;
    }




}