import current_page from "../../utils/pagination/page";
import DistributorRepository from "../distributor/distributor.repository";
import { OrderRepository } from "../order/order.repository";
import ProductRepository from "../product/product.repository";

export default class AdminService {
    private orderRepository = new OrderRepository();
    private productRepository = new ProductRepository();
    private distributorRepository = new DistributorRepository()

    public getAllProducts = async()=>{
        const products = await this.productRepository.getAllProduct();
        return products;
    }

    public getAllDistributors = async()=>{
        const distributors = await this.distributorRepository.getAllDistributors();
        return distributors;
    }

    public getAllOrders = async()=>{
        const orders = await this.orderRepository.getAllOrders();
        return orders;
    }




}