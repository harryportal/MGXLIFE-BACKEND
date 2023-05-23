import { Request, Response } from "express";
import AuthService from "./auth.service";
import { AuthRequest, distributorPayload } from "./auth.interface";

export class AuthController {
    private static authService = new AuthService();

    static signUp = async(req:Request, res:Response)=>{
        const {referringId, ...userData }= req.body;
        const distributor = await this.authService.createDistributor(userData, referringId)
        return res.status(201).json({success:true, message:"Check your inbox for a verification Mail"});
    }

    static resetPassword = async(req:Request, res:Response)=>{
        let {password, confirmPassword, token} = req.body;
        await this.authService.resetPassword(token, password, confirmPassword)
        return res.status(200).json({success:true, message:"success"})
    }

    static getAccessToken = async(req:Request, res:Response)=>{
        const refreshToken = req.query.token as string;
        const accessToken = await this.authService.getAccessToken(refreshToken);
        return res.json({success:true, data: {accessToken}})
    }

    static getVerificationMail = async(req:AuthRequest, res:Response)=>{
        const {firstname, email} = req.user as distributorPayload;
        await this.authService.sendVerificationMail(firstname, email);
        return res.status(200).json({success:true, message:"Check your inbox for a verification Mail"});
    }

    static deleteRefreshToken = async(req:Request, res:Response)=>{
        const refreshToken = req.query.token as string;
        await this.authService.deleteRefreshToken(refreshToken);
        return res.status(204);
    }

    static verifyEmail = async(req:Request, res:Response)=>{
        const verificationToken = req.query.token as string;
        await this.authService.verifyEmail(verificationToken);
        return res.status(200).json({success:true, message:"Email has been verified"});
    }

    static SignIn = async(req:Request, res:Response)=>{
        const  {email, password} = req.body;
        const {accessToken, refreshToken} = await this.authService.signIn(email, password); 
        return res.json({success:true, data: {refreshToken, accessToken}})
    }


    static forgotPassword = async(req:Request, res:Response)=>{
        const email = req.query.email as string;
        await this.authService.forgotPassword(email);
        return res.json({success:true, message:"Check Your Inbox!"})
    }
    
}