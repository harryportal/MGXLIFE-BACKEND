import { Response } from "express";
import DistributorService from "./distributor.service";
import { AuthRequest } from "../auth/auth.interface";
import { File } from "./distributor.dtos";


export default class DistributorController {
    private static distributorService = new DistributorService();

    static getProfile = async(req:AuthRequest, res:Response)=>{
        let {id} = req.user!;
        const profile = await this.distributorService.getDistributor(id);
        return res.status(200).json({success:true, data:profile})
    }

    static getReferrals = async(req:AuthRequest, res:Response)=>{
        const distributorId = req.user!.id;
        const referredUsers = await this.distributorService.getRefferedUsers(distributorId);
        return res.status(200).json({success:true, data:referredUsers});
    }

    static getReferralLinks = async(req:AuthRequest, res:Response)=>{
        /* So there are two referral links:
        1. One for potential distributors 
        2. people that just want to buy and go */
        const {refferalId} = req.user!;
        const {buyerReferralLink, distributorReferralLink} = await this.distributorService.getReferralLinks(refferalId);
        return res.status(200).json({success:true, data:{ buyerReferralLink, distributorReferralLink } })

    }

    static updateProfile = async(req:AuthRequest, res:Response)=>{
        const distributorId = req.user!.id;
        const imageFile = req.file as File;
        const profileData = req.body;
        const updatedProfile = await this.distributorService.updateProfile(distributorId, profileData, imageFile);
        return res.status(200).json({success:true, data:updatedProfile})
    }

    static getOrders = async(req:AuthRequest, res:Response)=>{
        // This returns the orders that were made through the current distributor referral Id
        const distributorId = req.user!.id;
        const orders = await this.distributorService.getOrders(distributorId);
        return res.status(200).json({success:true, data:orders});
    }
    
}