import AdminService from "./admin.service";
import { AuthRequest } from "../auth/auth.interface";
import { File, UpdateAdmin } from "./admin.dtos";
import { Response } from "express";
import { SignIn, UpdateProduct } from "./admin.validation";


export default class AdminController {
    private static adminService = new AdminService();

    public static signIn = async(req:AuthRequest, res:Response)=>{
        let {email, password} = req.body as SignIn;
        const accessToken = await this.adminService.signIn(email,password);
        return res.status(200).json({success:true, data:{accessToken}});
    }

    public static updateProfile = async(req:AuthRequest, res:Response)=>{
        const profileData = req.body as UpdateAdmin;
        const adminId = req.user!.id;
        const imageFile = req.file as File;
        const updatedProfile = await this.adminService.updateAdmin(profileData, adminId, imageFile);
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
        const productId = req.params.id;
        const updateData = req.body as UpdateProduct;
        const updatedProduct = await this.adminService.updateProduct(productId, updateData);
        return res.status(200).json({success:true, data:updatedProduct})
    }
}