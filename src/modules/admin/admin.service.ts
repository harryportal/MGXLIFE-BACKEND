import { inject, injectable } from "inversify";
import { AuthError } from "../../common/error";
import { comparePassword, createAdminToken } from "../../utils/jwtAuth/jwt";
import current_page from "../../utils/pagination/page";
import uploadImage from "../../utils/upload/uploadImage";
import { AdTypes, File, IAdminRepository, UpdateAdmin, IAdminService } from "./admin.dtos";
import { UpdateProduct } from "./admin.validation";
import { IOrderRepository, OTypes } from "../order/order.dtos";
import { IProductService, PdTypes } from "../product/product.dtos";
import { DTypes, IDistributorRepository } from "../distributor/distributor.dtos";

@injectable()
export default class AdminService implements IAdminService{
    private adminRepository;
    private orderRepository;
    private productService;
    private distributorRepository;
    constructor(@inject(AdTypes.IAdminRepository)adminRepository:IAdminRepository,
    @inject(OTypes.IOrderRepository)orderRepository:IOrderRepository,
    @inject(PdTypes.IProductService)productService:IProductService,
    @inject(DTypes.IDistributorRepository)distributorRepository:IDistributorRepository
    ){
        this.adminRepository = adminRepository;
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.distributorRepository = distributorRepository;
    }

    public signIn = async(email:string, password:string)=>{
        const admin = await this.adminRepository.getAdmin(email.toLocaleLowerCase());
        console.log(admin);
        if(!admin) { throw new AuthError("Invalid Login Credentials") }

        const checkPassword = await comparePassword(password, admin.password!)
        if(!checkPassword) { throw new AuthError("Invalid Login Credentials") }
        
        const accessToken =  createAdminToken(admin);
        return accessToken;
    }

    public updateAdmin = async(updateData:UpdateAdmin, adminId:string, imageFile:File|null)=>{
        if(imageFile){
            const response = await uploadImage(imageFile);
            updateData.imageUrl = response.imageUrl!;
        };
        const updatedAdmin = await this.adminRepository.updateAdmin(adminId, updateData);
        return updatedAdmin;
    }

    public getAllProducts = async(pageNumber:string)=>{
        const paginationObject = current_page(pageNumber); 
        const products = await this.productService.getAllProducts(paginationObject);
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

    public updateProduct = async(productId:string, updateData:UpdateProduct)=>{
        const updatedProduct = await this.productService.updateProduct(updateData, productId);
        return updatedProduct;
    }
}