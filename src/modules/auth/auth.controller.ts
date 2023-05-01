import { AuthRepository } from "./auth.repositories";
import { Request, Response } from "express";
import MailService from "../mail/mail.service";
import { AuthRequest, userPayload } from "./auth.interface";
import { AuthError, BadRequestError } from "../../common/error";
import { Profile, User } from "@prisma/client";
import { createTemplate} from "../../utils/mailTemplates/addResetPassword";
import { ISignIn } from "./auth.interface";
import Cloudinary from "../cloud/cloudinary.service";
import CompressImage from "../../utils/fileStorage/compressImage";
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
        const userData = req.body;
        const token = await this.authRepository.createUser(userData);
        res.status(201).json({success:true, token})
    }

    static addProfile = async(req:AuthRequest, res:Response)=>{
        // const userId = req.user!.id;  // get the user id from the request payload
        // const email = req.user!.email;
        const {id, email, fullname} = req.user as Required<userPayload>;
        const profileData = req.body as Profile;

        const file = await CompressImage(req.file);
        const imageUrl = await this.uploadImage(file.path);
        if (imageUrl) { profileData.imageUrl = imageUrl; }

        const profile = await this.authRepository.addProfile(profileData, id);

        // todo: create a token and send with frontend origin along the mail template
        // create a token that will be sent with the email templates
        const user = await this.authRepository.getUser(id, null) as User;
        const userToken = createAcessToken(user, false);
        const mailtemplate = createTemplate(fullname, userToken,"SmeBud", "2022")
        await this.mailService.sendMail({to:email, subject: "Welcome to SmeBud", html:mailtemplate})
        return res.status(201).json({succes:true, profile});
    }


    static addorResetPassword = async(req:Request, res:Response)=>{
        let {password, confirmPassword, token} = req.body;
        if (password !== confirmPassword){
            throw new BadRequestError("Passwords do not match!")
        }
        await this.authRepository.addPassword(password, token)
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
        const user = await this.authRepository.getUser(null, email) as User;
        if(!user) { throw new AuthError("No Email with associated Account!")}
        const userToken = createAcessToken(user, false);
        const mailtemplate = createTemplate(user.fullname, userToken,"SmeBud", "2022")
        await this.mailService.sendMail({to:email, subject: "Welcome to SmeBud", html:mailtemplate})
        return res.json({success:true})
    }
    
}