import { Request, Response } from "express";
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

    static updateProfile = async(req:AuthRequest, res:Response)=>{
        const distributorId = req.user!.id;
        const imageFile = req.file as File;
        const profileData = req.body;
        const updatedProfile = await this.distributorService.updateProfile(distributorId, profileData, imageFile);
        return res.status(200).json({success:true, data:updatedProfile})
    }
    
}