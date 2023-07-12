import { Response } from "express";
import { AuthRequest } from "../auth/auth.dto";
import { File, IDistributorService, Types} from "./distributor.interface";
import {injectable, inject} from "inversify";

@injectable()
export default class DistributorController {
    constructor(@inject(Types.IDistributorService)private readonly distributorService:IDistributorService){}
    
    public getProfile = async(req:AuthRequest, res:Response)=>{
        let {id} = req.user!;
        const profile = await this.distributorService.getDistributor(id);
        return res.status(200).json({success:true, data:profile})
    }

    public getReferrals = async(req:AuthRequest, res:Response)=>{
        const distributorId = req.user!.id;
        const referredUsers = await this.distributorService.getRefferedUsers(distributorId);
        return res.status(200).json({success:true, data:referredUsers});
    }

    public getReferralLinks = (req:AuthRequest, res:Response)=>{
        const {refferalId} = req.user!;
        const {buyerReferralLink, distributorReferralLink} = this.distributorService.getReferralLinks(refferalId);
        return res.status(200).json({success:true, data:{ buyerReferralLink, distributorReferralLink } })

    }

    public updateProfile = async(req:AuthRequest, res:Response)=>{
        const distributorId = req.user!.id;
        const imageFile = req.file as File;
        const profileData = req.body;
        const updatedProfile = await this.distributorService.updateProfile(distributorId, profileData, imageFile);
        return res.status(200).json({success:true, data:updatedProfile})
    }

    public getOrders = async(req:AuthRequest, res:Response)=>{
        // This returns the orders that were made through the current distributor referral Id
        const distributorId = req.user!.id;
        const orders = await this.distributorService.getDistributorOrders(distributorId);
        return res.status(200).json({success:true, data:orders});
    }
    
}