import Cloudinary from "../cloud/cloudinary.service";
import shortid from "shortid";
import AuthRepository from "./auth.repositories";
import { AuthError, BadRequestError } from "../../common/error";
import { comparePassword, createAcessToken, createRefreshToken, hashPassword, verifyJWT } from "../../utils/jwtAuth/jwt";
import { Distributor } from "@prisma/client";
import MailService from "../mail/mail.service";
import { createresetTemplate } from "../../utils/mailTemplates/resetPassword";

export default class AuthService {
    private cloudinaryService;
    private authRepository;
    private mailService;
    constructor(){
        this.cloudinaryService = new Cloudinary();
        this.authRepository = new AuthRepository();
        this.mailService = new MailService();
    }

    /* Logic for uploading the image */
    public uploadImage = async(imagepath:string):Promise<string | undefined>=>{
        if (!imagepath) { return "" };
        const { imageUrl } = await this.cloudinaryService.uploadImage(imagepath); 
        return imageUrl;
    }

    /* create the referal link using shortID and prepend the id with mg#.
    even though it will not be available to the user until subscription has been payed with stripe*/   
    public generateReferralLink = ():string=>{
        const randomString = shortid.generate();
        return `mg#${randomString}`;
    }

    public signIn = async(email:string, password:string)=>{
        const distributor = await this.authRepository.getDistributor(email);
        if(!distributor) { throw new AuthError("Invalid Login Credentials")}

        const checkPassword = await comparePassword(password, distributor.password!)
        if(!checkPassword) { throw new AuthError("Invalid Login Credentials") }
        
        const accessToken =  createAcessToken(distributor);
        const refreshToken = createRefreshToken(distributor.id);

        // creates a date 15 days from now.
        const refreshTokenExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); 
        this.authRepository.createRefreshToken(refreshToken, refreshTokenExpiresAt, distributor.id)
        return {accessToken, refreshToken};
    }
    
    public resetPassword = async(token:string, password:string, confirmPassword:string)=>{
        if (password !== confirmPassword){
            throw new BadRequestError("Passwords do not match!")
        }
        let distributor = verifyJWT(token);
        const hashedPassword = await hashPassword(password);
        await this.authRepository.resetPassword(distributor.id, hashedPassword);
    }

    /* Deletes the refresh token from the database so it can not be further used to generate 
    access tokens*/
    public deleteRefreshToken = async(refreshToken:string)=>{
        verifyJWT(refreshToken);
        await this.authRepository.deleteRefreshToken(refreshToken);
    }

    public getAccessToken = async(refreshToken:string)=>{
        const verifiedPayload = verifyJWT(refreshToken);
        const token = await this.authRepository.getRefreshToken(refreshToken)
        if (!token || token.expiresAt < new Date) { throw new AuthError("Invalid Refresh Token") };
        const user = await this.authRepository.getDistributor(verifiedPayload.email) as Distributor;
        const acessToken = createAcessToken(user);
        return acessToken;
    }

    public createDistributor = async(distributorData: Omit<Distributor, "id">, refferalId:string)=>{
        const {email, password} = distributorData;
        const checkEmail = await this.authRepository.getDistributor(email);
        if (checkEmail){ throw new AuthError("Email Already Exists!. Please use another Email Address")}
        const refferingId = this.generateReferralLink();
        distributorData.referringId = refferingId;
        distributorData.password = await hashPassword(password);
       
        let distributor: Distributor;
        if(refferalId) {
            distributor = await this.authRepository.createDistributorwithReferral(distributorData, refferalId)
        }else {
            distributor = await this.authRepository.createDistributorwithoutReferral(distributorData);
        }
        return distributor;
    }

    public forgotPassword = async(email:string)=>{
        const user = await this.authRepository.getDistributor(email) as Distributor;
        if(!user) { throw new AuthError("No Email with associated Account!")}
        const userToken = createAcessToken(user, false);

        const addPasswordUrl = `${process.env.FRONTENDURL}/reset-password?token=${userToken}`;
        const mailtemplate = createresetTemplate(user.firstName, addPasswordUrl);
        await this.mailService.sendMail({to:email, subject: "Reset Your Password", html:mailtemplate})
}}