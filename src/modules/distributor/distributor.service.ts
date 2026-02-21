import { Distributor } from "@prisma/client";
import { NotFoundError } from "../../common/error";
import { Types, File, IDistributorRepository, IDistributorService, UpdateDistributor} from "./distributor.interface";
import uploadImage from "../../utils/upload/uploadImage";
import { injectable, inject } from "inversify";
import { ComplaintDto } from "./distributor.dtos";
import { IMailService, MTypes } from "../mail/mail.dto";
import { complainEmailTemplate } from "../mail/mailTemplates/notifyAdmin";

@injectable()
export default class DistributorService implements IDistributorService{
    constructor(@inject(Types.IDistributorRepository)private readonly distributorRepository: IDistributorRepository,
    @inject(MTypes.IMailService)private readonly mailService:IMailService){}
    
    public getDistributor = async(distributorId:string)=>{
        const distributor = await this.distributorRepository.getProfile(distributorId) as Distributor;
        if(!distributor) { throw new NotFoundError("No Distributor with Id Found!")};
        const distributorData = this.removePassword(distributor);
        distributorData.commissionEarned =  parseFloat(distributorData.commissionEarned.toFixed(2));
        return distributorData;
    }

    private removePassword = (distributor:Distributor)=>{
        const {password, ...disitributorData} = distributor;
        return disitributorData;
    }

    public getRefferedUsers = async(distributorId:string)=>{
        const refferedUsers = await this.distributorRepository.getReferredUsers(distributorId);
        return refferedUsers;
    }

    public getDistributorOrders = async(distributorId:string)=>{
        const orders = await this.distributorRepository.getDistributorOrders(distributorId);
        return orders;
    }

    public getDistributorOrThrow = async(distributorId:string)=>{
        const distributor = await this.distributorRepository.getProfile(distributorId);
        if(!distributor) { throw new NotFoundError("No Distributor with Provided ID")};
    }


    public updateProfile = async(distributorId:string, profileData:UpdateDistributor, imageFile:File | null)=>{
        await this.getDistributorOrThrow(distributorId);
        if(imageFile){
            const response = await uploadImage(imageFile);
            profileData.imageUrl = response.imageUrl;
        };
        const updatedProfile = await this.distributorRepository.updateProfile(distributorId, profileData);
        const updatedProfileData = this.removePassword(updatedProfile);
        return updatedProfileData;
    }

    public sendEnquiry = async(complaint:ComplaintDto)=>{
        const {email, fullname, message} = complaint;
        const htmlTemplate = complainEmailTemplate(fullname, email, message)
        const adminEmail = process.env.ADMIN_EMAIL as string;
        await this.mailService.sendMail({to:adminEmail, subject:"You have a new MXG Question/Enquiry!", html:htmlTemplate })
    }

    public getReferralLinks = (refferalId:string)=>{
        const buyerReferralLink = `${process.env.SHOPIFY_URL}?ref=${refferalId}`
        const distributorReferralLink =`${process.env.SIGNUP_URL}?${refferalId}` 
        return {buyerReferralLink, distributorReferralLink}
    }
}