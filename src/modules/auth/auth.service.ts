import Cloudinary from "../cloud/cloudinary.service";
import shortid from "shortid";
import AuthRepository from "./auth.repositories";
import { AuthError, BadRequestError } from "../../common/error";
import { comparePassword, createAcessToken, createRefreshToken, createVerificationToken, hashPassword, verifyJWT } from "../../utils/jwtAuth/jwt";
import { Distributor } from "@prisma/client";
import MailService from "../mail/mail.service";
import { createresetTemplate } from "../../utils/mailTemplates/resetPassword";
import { completeprofileTemplate } from "../../utils/mailTemplates/completeProfile";
import PaymentRepository from "../payment/payment.repository";

export default class AuthService {
    private cloudinaryService;
    private authRepository;
    private mailService;
    private paymentRepository;
    constructor(){
        this.cloudinaryService = new Cloudinary();
        this.authRepository = new AuthRepository();
        this.mailService = new MailService();
        this.paymentRepository = new PaymentRepository()
    }

    /* Logic for uploading the image */
    private uploadImage = async(imagepath:string):Promise<string | undefined>=>{
        if (!imagepath) { return "" };
        const { imageUrl } = await this.cloudinaryService.uploadImage(imagepath); 
        return imageUrl;
    }

    /* create the referal link using shortID and prepend the id with mg#.
    even though it will not be available to the user until subscription has been payed with stripe*/   
    private generateReferralLink = ():string=>{
        const randomString = shortid.generate();
        return `mg#${randomString}`;
    }

    public verifyEmail = async(verificationToken:string)=>{
        const verifiedPayload = verifyJWT(verificationToken)
        if(verifiedPayload.type != "verify") {
            throw new BadRequestError("Please provide a valid verification token")
        }
        const { email } = verifiedPayload;
        // should first check if the distributor has been verified before performing the verification again.
        const distributor = await this.authRepository.getDistributor(email) as Distributor;
        if (!distributor.verified) { await this.authRepository.verifyDistributor(email) };
    }

    public signIn = async(email:string, password:string)=>{
        const distributor = await this.authRepository.getDistributor(email);
        if(!distributor) { throw new AuthError("Invalid Login Credentials")}

        const checkPassword = await comparePassword(password, distributor.password!)
        if(!checkPassword) { throw new AuthError("Invalid Login Credentials") }
        
        const accessToken =  createAcessToken(distributor);
        const refreshToken = createRefreshToken(distributor);

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
        const email = verifiedPayload.email;
        const user = await this.authRepository.getDistributor(email) as Distributor;
        const acessToken = createAcessToken(user);
        return acessToken;
    }

    public createDistributor = async(distributorData: Omit<Distributor, "id">, refferalId:string)=>{
        let {email, password} = distributorData;
        const checkEmail = await this.authRepository.getDistributor(email);
        if (checkEmail){ throw new AuthError("Email Already Exists!. Please use another Email Address")};
        const stripeCustomerId = await this.paymentRepository.createCustomer(email);
        const refferingId = this.generateReferralLink();
        distributorData.referringId = refferingId;
        distributorData.password = await hashPassword(password);
        distributorData.stripeCustomerId = stripeCustomerId;
        let distributor: Distributor;
        if(refferalId) {
            // first check if a distributor with that referal id exist
            await this.verifyReferralId(refferalId);
            distributor = await this.authRepository.createDistributorwithReferral(distributorData, refferalId)
        }else {
            distributor = await this.authRepository.createDistributorwithoutReferral(distributorData);
        }
        // create the stripe customer for this new distributor instantly
        await this.sendVerificationMail(distributor.firstName, distributor.email)
        }

    private verifyReferralId = async(refferingId:string)=>{
        const distributor = await this.authRepository.getDistributorwithReferalId(refferingId);
        if (!distributor) { throw new BadRequestError("No Distributor with the referral Id provided")}
    }

    public sendVerificationMail = async(firstname:string, email:string)=>{
        const verificationToken = createVerificationToken(email);
        const verifyEmailUrl = `${process.env.FRONTENDURL}/verifyemail/?token=${verificationToken}`;
        const mailtemplate = completeprofileTemplate(firstname, verifyEmailUrl);
        await this.mailService.sendMail({to:email, subject: "Verify Your Email Address", html:mailtemplate})
    }

    private removePassword = (distributor: Distributor)=>{
        const { password, ...sanitizedData } = distributor;
        return sanitizedData;
    }

    public forgotPassword = async(email:string)=>{
        const user = await this.authRepository.getDistributor(email) as Distributor;
        if(!user) { throw new BadRequestError("No Email with associated Account!")}
        if(!user.verified) {throw new BadRequestError("Please verify your email first!")}
        const userToken = createAcessToken(user);

        const addPasswordUrl = `${process.env.FRONTENDURL}/reset-password?token=${userToken}`;
        const mailtemplate = createresetTemplate(user.firstName, addPasswordUrl);
        await this.mailService.sendMail({to:email, subject: "Reset Your Password", html:mailtemplate})
}}