import {prisma} from "../../utils/db/prisma";
import { Profile, User } from "@prisma/client";
import { comparePassword, createAcessToken, createRefreshToken, hashPassword, verifyJWT } from "../../utils/jwtAuth/jwt";
import { AuthError, BadRequestError, ConflictError } from "../../common/error";
import { userPayload } from "./auth.interface";



export class AuthRepository{
    private user;
    private profile;
    private refreshToken;
    constructor(){
        this.user = prisma.user;
        this.profile = prisma.profile;
        this.refreshToken = prisma.refreshToken;
    }

    public createUser = async(userObject: Omit<User, "id">): Promise<string>=>{
        const { fullname, company, email, contact, referal, purpose, country } = userObject;

        //check if user with email exists already
        let checkEmail = await this.user.findUnique({
            where: {email}
        })

        if (checkEmail) { throw new ConflictError() };

        let userData: User = await this.user.create({
            data:{
                fullname, company, email, contact, referal, purpose, country
            }, 
        });

        const token = createAcessToken(userData, false);
        return token // return just the token so they can be authenticated to proceed to setting up profile
    }

    public getUser = async(id:string | null, email:string |  null)=>{
        // returns user with the given Id or email address
        let user;
        if (id) {
            user = await prisma.user.findUnique({
            where: { id }
            });
        } else if (email) {
            user = await prisma.user.findUnique({
            where: { email }
            });
        } else {
            throw new BadRequestError('Both ID and email are empty.');
        }
        if(!user) {  throw new AuthError("No User with Email or ID!")}
        return user;
    }

    public addProfile = async(profileObject: Omit<Profile, "id">, userId: string)=>{
        let {category, businessNo, businessCategory, businessModel, 
            dealSizeMin, dealSizeMax, financeRequired, aboutCompany, imageUrl } = profileObject;
        
    
        financeRequired = Boolean(financeRequired);
        dealSizeMax = Number(dealSizeMax);
        businessNo = Number(businessNo);
        dealSizeMin = Number(dealSizeMin);
    
        const profile = await this.profile.create({
            data:{
                category, businessNo, businessCategory, businessModel, dealSizeMax, dealSizeMin, financeRequired, 
                aboutCompany, imageUrl, user: {connect: {id: userId}}
            }
        });
        return profile;
    }

    public addPassword = async(password: string, token:string): Promise<User>=>{
        // decode the token to fetch the user that the password belongs to
        const user: userPayload = verifyJWT(token);

        const updatedUser = await this.user.update({
            where:{
                email: user.email
            }, 
            data:{
                password: await hashPassword(password)
            }
        })

        return updatedUser; 
     }


    public getAcessToken = async(refreshToken:string)=>{
        const verifiedPayload = verifyJWT(refreshToken);

        // check if the refresh token belongs to the user and is not expired
        const token = await this.refreshToken.findUnique({
            where: {  token: refreshToken }
        });

        if (!token || token.expiresAt < new Date) { throw new AuthError("Invalid Refresh Token") };

        // generate new access token for the user
        const user = await this.user.findUnique({
            where: {
                id: verifiedPayload.id
            }
        }) as User;
        
        const acessToken = createAcessToken(user);
        return acessToken;
        
    }

    public deleteRefreshToken = async(refreshToken:string)=>{
        verifyJWT(refreshToken);
        
        const deletedToken = await this.refreshToken.delete({
            where: { token: refreshToken }
        });        
    }

    public signinUser = async(email:string, password:string)=>{
        const user = await this.user.findUnique({
            where:{ email }
        });
    
        if(!user) { throw new AuthError("Invalid Login Credentials")}

        // throw an error if the user has not set the password;
        if(!user.password) {  throw new AuthError("No password associated with current user!") }

        const checkPassword = await comparePassword(password, user.password!)
        if(!checkPassword) { throw new AuthError("Invalid Login Credentials") }
        
        const accessToken =  createAcessToken(user);
        const refreshToken = createRefreshToken(user.id);

        // creates a date 15 days from now.
        const refreshTokenExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); 
        await this.refreshToken.create({
            data:{
                expiresAt: refreshTokenExpiresAt,
                token: refreshToken,
                user: {connect: {id:user.id }}
            }
        });

        return {refreshToken, accessToken}
    }


}

