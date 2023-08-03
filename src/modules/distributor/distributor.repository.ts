import { AccountStatus, PrismaClient, SubscriptionStatus } from "@prisma/client";
import logger from "../../utils/logging/winston";
import IPagination from "../../utils/pagination/pagination.interface";
import { injectable, inject } from "inversify";
import { IDistributorRepository, UpdateDistributor } from "./distributor.interface";

@injectable()
export default class DistributorRepository implements IDistributorRepository{
    private readonly distributor;
    private readonly transaction;
    constructor(@inject(PrismaClient)prisma:PrismaClient){
        this.distributor = prisma.distributor;
        this.transaction = prisma.subscriptionTransaction;
    }
    
    public getProfile = async(distributorId:string) => {
        const distributor = await this.distributor.findUnique({
            where: {
                id: distributorId
            }
        });
        return distributor;
    }


    public getDistributor = async(email:string)=>{
        const distributor = await this.distributor.findUnique({
            where: {
                email
            }
        });
        return distributor;
    }

    public updateDistributorAccountStatus = async(email:string)=>{
        await this.distributor.update({
            where: {email},
            data:{accountStatus: AccountStatus.ACTIVE}
        })
    }

    public updateDistributorCommission = async(distributorId:string, commission:number, groupVolume:number)=>{
        await this.distributor.update({
            where:{ id: distributorId },
            data:{ commissionEarned:{increment: commission}, groupVolume: {increment: groupVolume}}
        });
    }

    public getReferredUsers = async(distributorId:string)=>{
        const referredUsers = await this.distributor.findMany({
            where:{
                id:distributorId
            }, select:{ 
                referredUsers:{ select: {
                    firstName:true, lastName:true, email:true, subscriptionStatus:true,
                    imageUrl:true, commissionEarned:true, verified:true, referredUsers: {
                        select: {
                            firstName:true, lastName:true, email:true, subscriptionStatus:true,
                            imageUrl:true, commissionEarned:true, verified:true
                        }
                    }
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
    
      public updateDistributorGroupVolume = async(distributorId:string, amount:number)=>{
            const distributor = await this.distributor.update({
                where: {id: distributorId},
                data: {groupVolume: {increment:amount}}
            });
            return distributor;

      }
      public updateSponsoringDistributorVolumeCredit = async(SponsoringDistributorId:string, volumeCredit:number)=>{
        const updatedSponsoringDistributor = await this.distributor.update({
            where:{ id: SponsoringDistributorId },
            data:{ groupVolume: {
                increment: volumeCredit
            }}
        });
        console.log(updatedSponsoringDistributor);
        logger.info(`Distributor with id ${updatedSponsoringDistributor} has been updated with volumeCredit ${volumeCredit}`)
    }
    
    public createSubscriptionTransaction = async(stripeId:string, stripeCustomerId:string)=>{
        await this.transaction.create({
            data:{
                stripeId, distributor:{connect:{stripeCustomerId}}
            }
        })
    }

    public getSubsriptionTransaction = async(stripeId:string)=>{
        return await this.transaction.findUnique({
            where:{ stripeId }
        })
    }

    public getAllDistributors = async(paginationObject:IPagination)=>{
        const {take, skip} = paginationObject;
        const distributors = await this.distributor.findMany({
            take, skip, select:{
                id:true, firstName:true, lastName:true, email:true,
                subscriptionStatus:true, referredBy:{
                    select: {
                        id:true, firstName:true, lastName:true, email:true
                    }}, commissionEarned:true, refferalCount:true, imageUrl:true, referringId:true,
                    groupVolume:true, verified:true
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

    public resetDistributorBalance = async(stripeAccountId:string)=>{
        await this.distributor.update({
            where: {
                accountId: stripeAccountId
            },data:{
                groupVolume: 0.0, commissionEarned:0.0
            }
        })
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

    public updateProfile = async(distributorId:string, profileData:UpdateDistributor)=>{
        const {firstname, lastname, imageUrl} = profileData;
        const updatedDistributor = await this.distributor.update({
            where:{
                id: distributorId
            }, data:{
                firstName:firstname, lastName:lastname, imageUrl
            }
        });
        return updatedDistributor;
    };

    public getDistributorwithReferralId = async(refferalId:string)=>{
        const distributor = await this.distributor.findUnique({
            where: {referringId: refferalId}
        });
        return distributor;
    };

    public addVolumeCredit = async(distributorId:string, amount:number)=>{
        await this.distributor.update({
            where:{
                id: distributorId
            }, data:{
                groupVolume: {
                    increment: amount
                }
            }
        })
    }


}