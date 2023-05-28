import { Request, Response } from "express";
import DistributorService from "./distributor.service";
import { AuthRequest } from "../auth/auth.interface";

export default class DistributorController {
    private static distributorService = new DistributorService();

    static getProfile = async(req:AuthRequest, res:Response)=>{
        let {id} = req.user!;
        const profile = await this.distributorService.getDistributor(id);
        return res.status(200).json({success:true, data:profile})
    }
    
}