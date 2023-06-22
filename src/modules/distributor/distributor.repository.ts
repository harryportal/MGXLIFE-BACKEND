import { prisma } from "../../utils/db/prisma";
import { Distributor, SubscriptionStatus } from "@prisma/client";

export default class DistributorRepository {
    private distributor;
    constructor(){
        this.distributor = prisma.distributor;
    }

    public getProfile =async(distributorId:string) => {
        const distributor = await this.distributor.findUnique({
            where: {
                id: distributorId
            }
        });
        return distributor;
    }

    public getRefferedUsers = async(distributorId:string)=>{
        const refferedUsers = await this.distributor.findMany({
            where:{
                id:distributorId
            }, select:{
                referredUsers:true
            }
        })
        return refferedUsers;

    }

    public getDistributorwithEmail = async(email:string)=> {
        const distributor = await this.distributor.findUnique({
            where: {email}
        });
        return distributor;
    }

    public getDistributorwithStripeId = async(stripeId:string)=> {
        const distributor = await this.distributor.findUnique({
            where: {stripeCustomerId: stripeId}
        });
        return distributor;
    }

    public updateDistributorSubscriptionStatus = async(distributorStripeId:string, status:SubscriptionStatus)=>{
        const distributor = await this.distributor.update({
            where:{ stripeCustomerId: distributorStripeId}, 
            data:{ subscriptionStatus: status }
        })
        return distributor;
    }

    public updateProfile = async(distributorId:string, profileData:Partial<Distributor>)=>{
        const {firstName, lastName, imageUrl} = profileData;
        const updatedDistributor = await this.distributor.update({
            where:{
                id: distributorId
            }, data:{
                firstName, lastName, imageUrl
            }
        });
        return updatedDistributor;
    };

    public getDistributorwithReferralId = async(refferalId:string){
        const distributor = await this.distributor.findUnique({
            where: {referringId: refferalId}
        });
        return distributor;
    }


}