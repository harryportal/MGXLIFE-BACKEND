import { Request, Response } from "express";
import AuthService from "./auth.service";

export class AuthController {
    private static authService = new AuthService();

    static signUp = async(req:Request, res:Response)=>{
        const {refferingId, ...userData }= req.body;
        const distributor = await this.authService.createDistributor(userData, refferingId)
        return res.status(201).json({success:true, data:distributor})
    }

    static resetPassword = async(req:Request, res:Response)=>{
        let {password, confirmPassword, token} = req.body;
        await this.authService.resetPassword(token, password, confirmPassword)
        return res.status(200).json({success:true})
    }

    static getAccessToken = async(req:Request, res:Response)=>{
        const {refreshToken} = req.body;
        const accessToken = await this.authService.getAccessToken(refreshToken);
        res.json({success:true, data: {accessToken}})
    }

    static deleteRefreshToken = async(req:Request, res:Response)=>{
        const {refreshToken} = req.body;
        await this.authService.deleteRefreshToken(refreshToken);
        return res.status(204).json({success:true});
    }

    static SignIn = async(req:Request, res:Response)=>{
        const  {email, password} = req.body;
        const {accessToken, refreshToken} = await this.authService.signIn(email, password); 
        res.json({success:true, data: {refreshToken, accessToken}})
    }


    static forgotPassword = async(req:Request, res:Response)=>{
        const {email} = req.body;
        await this.authService.forgotPassword(email);
        return res.json({success:true})
    }
    
}