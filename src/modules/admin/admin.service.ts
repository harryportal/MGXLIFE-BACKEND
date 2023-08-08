import { inject, injectable } from "inversify";
import { AuthError, BadRequestError } from "../../common/error";
import { comparePassword, createAdminToken, hashPassword } from "../../utils/jwtAuth/jwt";
import current_page from "../../utils/pagination/page";
import uploadImage from "../../utils/upload/uploadImage";
import { AdTypes, File, IAdminRepository, UpdateAdmin, IAdminService } from "./admin.interface";
import { UpdateProduct } from "./admin.validation";
import { IOrderRepository, OTypes } from "../order/order.dtos";
import { IProductService, PdTypes } from "../product/product.interface";
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
        const {accountId, groupVolume, firstName, email} = await this.distributorRepository.
        getProfile(distibutorId) as Distributor;
        /* todo: check the commission earned logic to know how payment is made for it
           Confirm if the user get the payment for a previous level when they get to a new level
           Confirm if the all the group volume and commission should be cleared after payment
           E.g at the end of the month I have $2000 in commission and $3500 in group volume. What happens when payment
           is made here
        */
        const amount = groupVolume;
        const amountBonus = this.calculateBonusAmount(amount);
        await this.paymentService.payOutCustomer(accountId, amountBonus);
        await this.mailCustomerForPayment(firstName, email);
    }
    
    private calculateBonusAmount = (amount:number):number=>{
        let amountBonus:number;
        switch(true){
            case amount >= 1000 && amount < 2500:
                amountBonus = 100;
                break;
            case amount >= 2500 && amount < 5000:
                amountBonus = 250;
                break;
            case amount >= 5000 && amount < 7500:
                amountBonus = 500;
                break;
            case amount >= 7500 && amount < 10000:
                amountBonus = 750;
                break;
            case amount >= 10000 && amount < 20000:
                amountBonus = 1000;
                break;
            case amount >= 20000 && amount < 30000:
                amountBonus = 2000;
                break;
            case amount >= 30000 && amount < 50000:
                amountBonus = 3000;
                break;
            default:
                amountBonus = 5000;
        }
        return amountBonus;
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