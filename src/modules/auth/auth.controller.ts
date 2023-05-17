import { AuthRepository } from "./auth.repositories";
import { Request, Response } from "express";
import MailService from "../mail/mail.service";
import { AuthError, BadRequestError } from "../../common/error";
import { Distributor} from "@prisma/client";
import { ISignIn } from "./auth.interface";
import Cloudinary from "../cloud/cloudinary.service";
import { createAcessToken } from "../../utils/jwtAuth/jwt";


export class AuthController {
    private static authRepository = new AuthRepository();
    private static mailService  = new MailService();
    private static cloudinaryService = new Cloudinary();

    /* Logic for uploading the image */
    private static uploadImage = async(imagepath:string)=>{
        if (!imagepath) { return "" };
        const { imageUrl } = await this.cloudinaryService.uploadImage(imagepath); 
        return imageUrl;
    }

    static signUp = async(req:Request, res:Response)=>{
        const userData = req.body as Omit<Distributor, "id">;
        let distributor;
        if(userData.referringId){
            distributor = await this.authRepository.createDistributorwithReferal(userData);
        }else{
            distributor = await this.authRepository.createDistributorwithoutReferal(userData);
        }
        return res.status(201).json({success:true, data:distributor})
    }

    static resetPassword = async(req:Request, res:Response)=>{
        let {password, confirmPassword, token} = req.body;
        if (password !== confirmPassword){
            throw new BadRequestError("Passwords do not match!")
        }
        await this.authRepository.resetPassword(password, token)
        return res.status(200).json({success:true})
    }

    static getAccessToken = async(req:Request, res:Response)=>{
        const {refreshToken} = req.body;
        const accessToken = await this.authRepository.getAcessToken(refreshToken);

        res.json({success:true, data: {accessToken}})
    }

    static deleteRefreshToken = async(req:Request, res:Response)=>{
        const {refreshToken} = req.body;
        const deleted = await this.authRepository.deleteRefreshToken(refreshToken);

        return res.status(204).json({success:true});
    }

    static SignIn = async(req:Request, res:Response)=>{
        let {email, password} = req.body as ISignIn;
        
        const {accessToken, refreshToken}= await this.authRepository.signinUser(email.toLowerCase(), password);
        res.json({success:true, data: {refreshToken, accessToken}})
    }


    static forgotPassword = async(req:Request, res:Response)=>{
        const {email} = req.body;
        const user = await this.authRepository.getDistributor(email) as Distributor;
        if(!user) { throw new AuthError("No Email with associated Account!")}
        const userToken = createAcessToken(user, false);

        const addPasswordUrl = `${process.env.FRONTENDURL}/reset-password?token=${userToken}`;
        const mailtemplate = createresetTemplate(user.firstName, addPasswordUrl);
        await this.mailService.sendMail({to:email, subject: "Reset Your Password", html:mailtemplate})

        return res.json({success:true})
    }
    
}