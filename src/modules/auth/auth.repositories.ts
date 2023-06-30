import {prisma} from "../../utils/db/prisma";
import { DistributorwithoutReferral } from "./auth.interface";
import { injectable } from "inversify";

@injectable()
export default class AuthRepository{
    private refreshToken;
    private distributor;
    constructor(){
        this.distributor = prisma.distributor;
        this.refreshToken = prisma.refreshToken;
    }
    
    public getDistributor = async(email:string)=> {
        const distributor = await this.distributor.findUnique({
            where: {email}
        });
        return distributor;
    }

    public verifyDistributor = async(email:string)=>{
        await this.distributor.update({
            where:{ email }, data :{ verified: true }
        })
    }

    public createDistributorwithReferral = async(distributor:DistributorwithoutReferral,refferedById:string)=>{
        /* 
        This runs two queries using prisma transaction 
        1. Create the Distributor Account
        2. Update the Referall Count of the parent distributora
        */
        const  [newDistributor] = await prisma.$transaction([
            this.distributor.create({
            data:{
                ...distributor,
                referredBy: {connect: {referringId: refferedById}}
            } }),

            this.distributor.update({
                where: {referringId:refferedById},
                data:{ 
                    refferalCount: {
                        increment: 1
                    }
                }
            })
        ])
        return newDistributor;
    }

    public getDistributorwithReferalId = async(referringId:string)=>{
        const distributor = await this.distributor.findUnique({
            where:{ referringId }
        });
        return distributor;
    }

    public createDistributorwithoutReferral = async(distributor:DistributorwithoutReferral)=>{
        const userData  = await this.distributor.create({ data:{ ...distributor } });
        return userData;
    }


    public getRefreshToken = async(refreshToken:string)=>{
        const token = await this.refreshToken.findUnique({ where: {  token: refreshToken } });
        return token;
    }

    public deleteRefreshToken = async(refreshToken:string):Promise<void>=>{
        await this.refreshToken.delete({ where: { token: refreshToken } });        
    }
    
    public resetPassword = async(distributorId:string, password:string)=>{
        await this.distributor.update({
            where:{ id: distributorId }, data:{ password }
            });
    }

    public createRefreshToken = async(refreshToken:string, expiresAt:Date, distributorId:string)=>{
         await this.refreshToken.create({
            data:{
                expiresAt,
                token: refreshToken,
                distributor: {connect: {id:distributorId }}
            }
        });
    }


}

