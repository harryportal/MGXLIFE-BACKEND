import { NotFoundError } from "../../common/error";
import { prisma } from "../../utils/db/prisma";
import { SubscriptionStatus } from "@prisma/client";

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


}