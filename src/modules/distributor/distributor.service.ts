import { Distributor } from "@prisma/client";
import { NotFoundError } from "../../common/error";
import DistributorRepository from "./distributor.repository";
import Cloudinary from "../cloud/cloudinary.service";
import { File } from "./distributor.dtos";

export default class DistributorService {
    private distributorRepository;
    private cloudinaryService;
    constructor(){
        this.distributorRepository =  new DistributorRepository();
        this.cloudinaryService = new Cloudinary();
    }

    public getDistributor = async(distributorId:string)=>{
        const distributor = await this.distributorRepository.getProfile(distributorId);
        let {password, ...disitributorData} = distributor as Distributor;
        disitributorData.commissionEarned =  Number(disitributorData.commissionEarned!.toPrecision(4));
        if(!distributor) { throw new NotFoundError("No Distributor with Id Found!")};
        return disitributorData;
    }

    public getRefferedUsers = async(distributorId:string)=>{
        const refferedUsers = await this.distributorRepository.getRefferedUsers(distributorId);
        return refferedUsers;
    }

    public getOrders = async(distributorId:string)=>{
        const orders = await this.distributorRepository.getOrders(distributorId);
        return orders;
    }

    public getDistributorOrThrow = async(distributorId:string)=>{
        const distributor = await this.distributorRepository.getProfile(distributorId);
        if(!distributor) { throw new NotFoundError("No Distributor with Provided ID")};
    }

    private uploadImage = async(imageFile:File)=>{
        const imageUrl = await this.cloudinaryService.uploadImage(imageFile.path);
        return imageUrl;
    }

    public updateProfile = async(distributorId:string, profileData:Partial<Distributor>, imageFile:File | null)=>{
        await this.getDistributorOrThrow(distributorId);
        if(imageFile){
            const response = await this.uploadImage(imageFile);
            profileData.imageUrl = response.imageUrl;
        };
        const updatedProfile = this.distributorRepository.updateProfile(distributorId, profileData);
        return updatedProfile;
    }

    public  getReferralLinks = async(refferalId:string)=>{
        const buyerReferralLink = `${process.env.SHOPIFY_URL}?ref=${refferalId}`
        const distributorReferralLink =`${process.env.SIGNUP_URL}?${refferalId}` 
        return {buyerReferralLink, distributorReferralLink}
    }
}