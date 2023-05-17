import {prisma} from "../../utils/db/prisma";
import { Distributor, RefreshToken } from "@prisma/client";
import { comparePassword, createAcessToken, createRefreshToken, hashPassword, verifyJWT } from "../../utils/jwtAuth/jwt";
import { AuthError, BadRequestError, ConflictError, NotFoundError } from "../../common/error";
//import { distributorPayload } from "./auth.interface";
import shortid from "shortid";


export class AuthRepository{
    private refreshToken;
    private distributor;
    constructor(){
        this.distributor = prisma.distributor;
        this.refreshToken = prisma.refreshToken;
    }

    /* create the referal link using shortID and prepend the id with mg#.
          even though it will not be available to the user until subscription has been payed with stripe*/   
    private generateReferralLink = ():string=>{
        const randomString = shortid.generate();
        return `mg#${randomString}`;
    }

    public createDistributorwithoutReferal = async(userObject: Omit<Distributor, "id">)=>{
        const {email, firstName, lastName, password} = userObject

        this.checkAccountwithEmail(email);
        const hashedPassword = await hashPassword(password);
        const referringId = this.generateReferralLink();
        
        // todo: remove password before returning the data!
        const userData  = await this.distributor.create({
            data:{
                email, firstName, lastName, password: hashedPassword, referringId
            }
        });
        return userData;

    }
    public getDistributor = async(email:string)=> {
        const distributor = await this.distributor.findUnique({
            where: {
                email
            }
        });
        if(!distributor) {  throw new NotFoundError("No Distributor with Email exists!")};
        return distributor;
    }

    // returns a conflict error if a distributor with email already exists
    private checkAccountwithEmail = async(email:string)=>{
        //check if user with email exists already
        let checkEmail = await this.distributor.findUnique({
            where: {email}
        })
        if (checkEmail) { throw new ConflictError("An account with a distributor exists") };
    }
    
    public createDistributorwithReferal = async(userObject: Omit<Distributor, "id">)=>{
        const {email, firstName, lastName, password, referredById} = userObject
        this.checkAccountwithEmail(email);
        const referringId = this.generateReferralLink();
        const hashedPassword = await hashPassword(password);
        await this.distributor.findUnique({
            where: {
                referringId
            }
        }
        )

        const userData  = await this.distributor.create({
            data:{
                email, firstName, lastName, password: hashedPassword, 
                referredBy: {connect: {id: referredById}}, referringId
            }
        });
        return userData;
    }


    public getAcessToken = async(refreshToken:string)=>{
        const verifiedPayload = verifyJWT(refreshToken);

        const token = await this.refreshToken.findUnique({
            where: {  token: refreshToken }
        });

        if (!token || token.expiresAt < new Date) { throw new AuthError("Invalid Refresh Token") };

        const user = await this.distributor.findUnique({
            where: {
                id: verifiedPayload.id
            }
        }) as Distributor;
        
        const acessToken = createAcessToken(user);
        return acessToken;
    };

    public deleteRefreshToken = async(refreshToken:string):Promise<void>=>{
        verifyJWT(refreshToken);
        
        const deletedToken = await this.refreshToken.delete({
            where: { token: refreshToken }
        });        
    }
    
    public resetPassword = async(token:string, password:string)=>{
        let distributor = verifyJWT(token);
        const hashedPassword = await hashPassword(password);
        distributor = await this.distributor.update({
            where:{
                id: distributor.id
            },
            data:{
                password: hashedPassword
            }
        });
    }

    public signinUser = async(email:string, password:string)=>{
        const distributor = await this.distributor.findUnique({
            where:{ email }
        });
    
        if(!distributor) { throw new AuthError("Invalid Login Credentials")}

        const checkPassword = await comparePassword(password, distributor.password!)
        if(!checkPassword) { throw new AuthError("Invalid Login Credentials") }
        
        const accessToken =  createAcessToken(distributor);
        const refreshToken = createRefreshToken(distributor.id);

        // creates a date 15 days from now.
        const refreshTokenExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); 
        await this.refreshToken.create({
            data:{
                expiresAt: refreshTokenExpiresAt,
                token: refreshToken,
                distributor: {connect: {id:distributor.id }}
            }
        });

        return {refreshToken, accessToken}
    }


}

