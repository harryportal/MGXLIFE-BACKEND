import { Request, Response } from "express";
import { ATypes, AuthRequest, IAuthService, jwtPayload } from "./auth.dto";
import { inject } from "inversify";

export class AuthController {
    private authService:IAuthService;
    constructor(@inject(ATypes.IAuthService)authService:IAuthService){
        this.authService = authService;
    }

    public signUp = async(req:Request, res:Response)=>{
        const {referringId, ...userData }= req.body;
        await this.authService.createDistributor(userData, referringId)
        return res.status(201).json({success:true, message:"Check your inbox for a verification Mail"});
    }

    public resetPassword = async(req:Request, res:Response)=>{
        let {password, confirmPassword, token} = req.body;
        await this.authService.resetPassword(token, password, confirmPassword)
        return res.status(200).json({success:true, message:"success"})
    }

    public getAccessToken = async(req:Request, res:Response)=>{
        const refreshToken = req.query.token as string;
        const accessToken = await this.authService.getAccessToken(refreshToken);
        return res.json({success:true, data: {accessToken}})
    }

    public getVerificationMail = async(req:AuthRequest, res:Response)=>{
        const {firstname, email} = req.user as jwtPayload;
        await this.authService.sendVerificationMail(firstname, email);
        return res.status(200).json({success:true, message:"Check your inbox for a verification Mail"});
    }

    public deleteRefreshToken = async(req:Request, res:Response)=>{
        const refreshToken = req.query.token as string;
        await this.authService.deleteRefreshToken(refreshToken);
        return res.status(204);
    }

    public verifyEmail = async(req:Request, res:Response)=>{
        const verificationToken = req.query.token as string;
        await this.authService.verifyEmail(verificationToken);
        return res.status(200).json({success:true, message:"Email has been verified"});
    }

    public SignIn = async(req:Request, res:Response)=>{
        const  {email, password} = req.body;
        const {accessToken, refreshToken} = await this.authService.signIn(email, password); 
        return res.json({success:true, data: {refreshToken, accessToken}})
    }

    public forgotPassword = async(req:Request, res:Response)=>{
        const email = req.query.email as string;
        await this.authService.forgotPassword(email);
        return res.json({success:true, message:"Check Your Inbox!"})
    }
    
}