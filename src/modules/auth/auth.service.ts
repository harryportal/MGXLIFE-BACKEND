import shortid from "shortid";
import { AuthError, BadRequestError } from "../../common/error";
import { comparePassword, createAcessToken, createRefreshToken, createVerificationToken, hashPassword, verifyJWT } from "../../utils/jwtAuth/jwt";
import { Distributor } from "@prisma/client";
import { createresetTemplate } from "../mail/mailTemplates/resetPassword";
import { completeprofileTemplate } from "../mail/mailTemplates/completeProfile";
import { inject, injectable } from "inversify";
import { ATypes, IAuthRepository, IAuthService } from "./auth.dto";
import { IMailService, MTypes } from "../mail/mail.dto";
import { IPaymentService, PTypes } from "../payment/payment.interface";


@injectable()
export default class AuthService implements IAuthService{
    constructor(@inject(MTypes.IMailService)private readonly mailService:IMailService, 
    @inject(ATypes.IAuthRepository)private readonly authRepository:IAuthRepository, 
    @inject(PTypes.IPaymentService)private readonly paymentService:IPaymentService){}

    /* create the referal link using shortID and prepend the id with mg#.
    even though it will not be available to the user until subscription has been payed with stripe*/   
    private generateReferralLink = ():string=>{
        const randomString = shortid.generate();
        return `mg${randomString}`;
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
        const distributor = await this.authRepository.getDistributor(email.toLowerCase());
        if(!distributor) { throw new AuthError("Invalid Login Credentials") }

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
        let distributor = verifyJWT(token);  // make token case insensitive
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
        const stripeCustomerId = await this.paymentService.createCustomer(email);
        const stripeAccountId = await this.paymentService.createConnectedAccount(email);
        const refferingId = this.generateReferralLink();
        distributorData.referringId = refferingId;
        distributorData.password = await hashPassword(password);
        distributorData.stripeCustomerId = stripeCustomerId;
        distributorData.accountId = stripeAccountId;
        distributorData.email = distributorData.email.toLowerCase();  // make case insensitive
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
        const verifyEmailUrl = `${process.env.FRONTENDURL}/verify_email.php?token=${verificationToken}`;
        const mailtemplate = completeprofileTemplate(firstname, verifyEmailUrl);
        await this.mailService.sendMail({to:email, subject: "Verify Your Email Address", html:mailtemplate})
    }
 
    public forgotPassword = async(email:string)=>{
        const user = await this.authRepository.getDistributor(email.toLowerCase()) as Distributor;
        if(!user) { throw new BadRequestError("No Email with associated Account!")}
        if(!user.verified) {throw new BadRequestError("Please verify your email first!")}
        const userToken = createAcessToken(user);

        const addPasswordUrl = `${process.env.FRONTENDURL}/reset_page.php?token=${userToken}`;
        const mailtemplate = createresetTemplate(user.firstName, addPasswordUrl);
        await this.mailService.sendMail({to:email, subject: "Reset Your Password", html:mailtemplate})
}}