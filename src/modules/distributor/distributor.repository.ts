import { Distributor, PrismaClient, SubscriptionStatus } from "@prisma/client";
import logger from "../../utils/logging/winston";
import IPagination from "../../utils/pagination/pagination.interface";
import { injectable, inject } from "inversify";
import { IDistributorRepository } from "./distributor.dtos";

@injectable()
export default class DistributorRepository implements IDistributorRepository{
    private readonly distributor;
    constructor(@inject(PrismaClient)prisma:PrismaClient){
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

    public getReferredUsers = async(distributorId:string)=>{
        const referredUsers = await this.distributor.findMany({
            where:{
                id:distributorId
            }, select:{ 
                referredUsers:{ select: {
                    firstName:true, lastName:true, email:true, subscriptionStatus:true,
                    imageUrl:true, commissionEarned:true, verified:true
                }}
            }
        })
        return referredUsers;
    }

    public getSponsoringDistributor = async (distributorId: string) => {
        //Find sponsoring distibutor to add volume credit
        const SponsoringDistributor = await this.distributor.findUnique({
          where: {
            id: distributorId,
          },
          select: {
            referredBy: {
              select: {
                id: true,
                email: true,
                subscriptionStatus: true,
                verified: true,
              },
            },
          },
        });
        return SponsoringDistributor?.referredBy;
      };
    
      public updateSponsoringDistributorVolumeCredit = async(SponsoringDistributorId:string, volumeCredit:number)=>{
        const updatedSponsoringDistributor = await this.distributor.update({
            where:{ id: SponsoringDistributorId },
            data:{ volumecredit: {
                increment: volumeCredit
            }}
        });
        console.log(updatedSponsoringDistributor);
        logger.info(`Distributor with id ${updatedSponsoringDistributor} has been updated with volumeCredit ${volumeCredit}`)
    }
      
    public getAllDistributors = async(paginationObject:IPagination)=>{
        const {take, skip} = paginationObject;
        const distributors = await this.distributor.findMany({
            take, skip, select:{
                firstName:true, lastName:true, email:true,
                subscriptionStatus:true, referredBy:{
                    select: {
                        firstName:true, lastName:true, email:true
                    }}, commissionEarned:true, refferalCount:true, imageUrl:true, referringId:true,
                    volumecredit:true, verified:true
                }
            });
        return distributors;
    }

    public getDistributorwithEmail = async(email:string)=> {
        const distributor = await this.distributor.findUnique({
            where: {email}
        });
        return distributor;
    }

    public getDistributorOrders = async(distributorId:string)=>{
        const distributorOrders = await this.distributor.findUnique({
            where:{ id: distributorId }, select:{ orders:true } });
        return distributorOrders;
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

    public getDistributorwithReferralId = async(refferalId:string)=>{
        const distributor = await this.distributor.findUnique({
            where: {referringId: refferalId}
        });
        return distributor;
    }


}