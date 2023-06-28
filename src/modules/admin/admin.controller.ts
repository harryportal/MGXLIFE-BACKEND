import AdminService from "./admin.service";
import { Response } from "express";
import { AuthRequest } from "../auth/auth.interface";


export default class AdminController {
    private static adminService = new AdminService();

    public static signIn = async(req:AuthRequest, res:Response)=>{
        let {email, password} = req.body;
        const accessToken = await this.adminService.signIn(email,password);
        return res.status(200).json({success:true, data:{accessToken}});
    }

    public static updateProfile = async(req:AuthRequest, res:Response)=>{
        const profileData = req.body;
        const adminId = req.user!.id;
        const updatedProfile = await this.adminService.updateAdmin(profileData, adminId);
        return res.status(200).json({success:true, data:updatedProfile})
    }

    public static getAllProducts = async(req:AuthRequest, res:Response)=>{
        const pageNumber = req.params.page;
        const products = await this.adminService.getAllProducts(pageNumber);
        return res.status(200).json({success:true, data:products});
    }

    public static getAllDistributors = async(req:AuthRequest, res:Response)=>{
        const pageNumber = req.params.page;
        const distributors = await this.adminService.getAllDistributors(pageNumber);
        return res.status(200).json({success:true, data:distributors});
    }   

    public static getAllOrders = async(req:AuthRequest, res:Response)=>{
        const pageNumber = req.params.page;
        const orders = await this.adminService.getAllOrders(pageNumber);
        return res.status(200).json({success:true, data:orders});
    }

    public static updateProduct = async(req:AuthRequest, res:Response)=>{
        
    }
}