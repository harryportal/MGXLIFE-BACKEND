import { AuthError, BadRequestError } from "../../common/error";
import { comparePassword, createAcessToken, createAdminToken } from "../../utils/jwtAuth/jwt";
import current_page from "../../utils/pagination/page";
import DistributorRepository from "../distributor/distributor.repository";
import { OrderRepository } from "../order/order.repository";
import ProductRepository from "../product/product.repository";
import { UpdateAdmin } from "./admin.dtos";
import AdminRepository from "./admin.repository";

export default class AdminService {
    private adminRepository = new AdminRepository();
    private orderRepository = new OrderRepository();
    private productRepository = new ProductRepository();
    private distributorRepository = new DistributorRepository()

    public signIn = async(email:string, password:string)=>{
        const admin = await this.adminRepository.getAdmin(email.toLocaleLowerCase());
        if(!admin) { throw new AuthError("Invalid Login Credentials") }

        const checkPassword = await comparePassword(password, admin.password!)
        if(!checkPassword) { throw new AuthError("Invalid Login Credentials") }
        
        const accessToken =  createAdminToken(admin);
        return accessToken;
    }

    public updateAdmin = async(updateData:UpdateAdmin, adminId:string)=>{
        const updatedAdmin = await this.adminRepository.updateAdmin(adminId, updateData)


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