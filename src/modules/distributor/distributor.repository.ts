import { prisma } from "../../utils/db/prisma";
import { Distributor, SubscriptionStatus } from "@prisma/client";
import logger from "../../utils/logging/winston";

export default class DistributorRepository {
    private distributor;
    constructor(){
        this.distributor = prisma.distributor;
    }

    public getProfile = async(distributorId:string) => {
        const distributor = await this.distributor.findUnique({
            where: {
                id: distributorId
            }
        });
        return distributor;
    }

    public updateDistributorCommission = async(distributorId:string, commission:number)=>{
        const updatedDistributor = await this.distributor.update({
            where:{ id: distributorId },
            data:{ commissionEarned:{
                increment: commission
            }}
        });
        console.log(updatedDistributor);
        logger.info(`Distributor with id ${updatedDistributor} has been updated with commission ${commission}`)
    }

    public getRefferedUsers = async(distributorId:string)=>{
        const refferedUsers = await this.distributor.findMany({
            where:{
                id:distributorId
            }, select:{ 
                referredUsers:{ select: {
                    firstName:true, lastName:true, email:true, subscriptionStatus:true,
                    imageUrl:true, commissionEarned:true, verified:true
                }}
            }
        })
        return refferedUsers;
    }

    public getAllDistributors = async()=>{
        const distributors = await this.distributor.findMany();
        return distributors;
    }

    public getDistributorwithEmail = async(email:string)=> {
        const distributor = await this.distributor.findUnique({
            where: {email}
        });
        return distributor;
    }

    public getOrders = async(distributorId:string)=>{
        /* returns the orders that were gotten with the current distributor refferal Id
           This should be in the orders module but omo i want to avoid stress 
        */
        const orders = await this.distributor.findUnique({
            where:{ id: distributorId }, select:{ orders:true } });
        return orders;
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
        const {password,  ...distributor} = updatedDistributor;
        return distributor;
    };

    public getDistributorwithReferralId = async(refferalId:string)=>{
        const distributor = await this.distributor.findUnique({
            where: {referringId: refferalId}
        });
        return distributor;
    }


}