import { Distributor } from "@prisma/client";
import { NotFoundError } from "../../common/error";
import { DTypes, File, IDistributorRepository, IDistributorService, UpdateDistributor} from "./distributor.dtos";
import uploadImage from "../../utils/upload/uploadImage";
import { injectable, inject } from "inversify";

@injectable()
export default class DistributorService implements IDistributorService{
    private readonly distributorRepository:IDistributorRepository;
    constructor(@inject(DTypes.IDistributorRepository)distributorRepository: IDistributorRepository){
        this.distributorRepository = distributorRepository;
    }
    
    public getDistributor = async(distributorId:string)=>{
        const distributor = await this.distributorRepository.getProfile(distributorId);
        if(!distributor) { throw new NotFoundError("No Distributor with Id Found!")};
        const distributorData = this.removePassword(distributor);
        distributorData.commissionEarned =  Number(distributorData.commissionEarned!.toPrecision(4));
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

    public  getReferralLinks = (refferalId:string)=>{
        const buyerReferralLink = `${process.env.SHOPIFY_URL}?ref=${refferalId}`
        const distributorReferralLink =`${process.env.SIGNUP_URL}?${refferalId}` 
        return {buyerReferralLink, distributorReferralLink}
    }
}