import { inject, injectable } from "inversify";
import { AuthError, BadRequestError } from "../../common/error";
import { comparePassword, createAdminToken, hashPassword } from "../../utils/jwtAuth/jwt";
import current_page from "../../utils/pagination/page";
import uploadImage from "../../utils/upload/uploadImage";
import { AdTypes, File, IAdminRepository, UpdateAdmin, IAdminService } from "./admin.interface";
import { UpdateProduct } from "./admin.validation";
import { IOrderRepository, OTypes } from "../order/order.dtos";
import { IProductService, PdTypes } from "../product/product.dtos";
import { Types, IDistributorRepository } from "../distributor/distributor.interface";
import { Admin, Distributor } from "@prisma/client";
import { IPaymentService, PTypes } from "../payment/payment.interface";
import { notifyCustomerPayment } from "../mail/mailTemplates/paymentConfirmation";
import { IMailService, MTypes } from "../mail/mail.dto";

@injectable()
export default class AdminService implements IAdminService{
    constructor(@inject(AdTypes.IAdminRepository)private readonly adminRepository:IAdminRepository,
    @inject(PTypes.IPaymentService)private readonly paymentService:IPaymentService,
    @inject(OTypes.IOrderRepository)private readonly orderRepository:IOrderRepository,
    @inject(PdTypes.IProductService)private readonly productService:IProductService,
    @inject(MTypes.IMailService)private readonly mailService:IMailService,
    @inject(Types.IDistributorRepository)private readonly distributorRepository:IDistributorRepository
    ){}

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

    public getProfile = async(adminEmail:string)=>{
        const profileData = await this.adminRepository.getAdmin(adminEmail) as Admin;
        const {password, ...profile} = profileData;
        return profile;
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

    private mailCustomerForPayment = async(name:string, email:string)=>{
        const loginLink = await this.paymentService.getConnectedAccountLoginLink(email);
        const emailTemplate = notifyCustomerPayment(name, loginLink.url);
        await this.mailService.sendMail({to:email, subject: "Verify Your Email Address", html:emailTemplate})
    }

    public payDistributor = async(distibutorId:string)=>{
        const {accountId, commissionEarned, groupVolume, firstName, email} = await this.distributorRepository.
        getProfile(distibutorId) as Distributor;
        const amount = commissionEarned + groupVolume;
        await this.paymentService.payOutCustomer(accountId, amount);
        await this.mailCustomerForPayment(firstName, email);
    }

    public getAllOrders = async(pageNumber:string)=>{
        const paginationObject = current_page(pageNumber);
        const orders = await this.orderRepository.getAllOrders(paginationObject);
        return orders;
    }
    
    public resetPassword = async(secret:string, password:string, confirmPassword:string, id:string)=>{
        if(secret != process.env.ADMIN_SECRET){
            throw new BadRequestError("Invalid Admin Secret!")
        }
        if(password != confirmPassword){
            throw new BadRequestError("Passwords do not match!")
        }
        const hashedPassword = await hashPassword(password);
        await this.adminRepository.resetPassword(id, hashedPassword);
    }   

    public updateProduct = async(productId:string, updateData:UpdateProduct)=>{
        const updatedProduct = await this.productService.updateProduct(updateData, productId);
        return updatedProduct;
    }
}