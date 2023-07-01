import { Distributor, Order, SubscriptionStatus } from "@prisma/client"
import IPagination from "../../utils/pagination/pagination.interface";

export type File = Express.Multer.File

type DistributorData = Omit<Distributor, "password">;
type ReferredUsers = Pick<Distributor,  "firstName" | "lastName" | "email" | 
    "subscriptionStatus" | "imageUrl" | "commissionEarned" | "verified">

interface AllDistributors extends Partial<Distributor>{
    referredBy:{
        firstName:string,
        lastName:string,
        email:string
    } | null
}

export interface IDistributorService {
    getDistributor(id:string): Promise<DistributorData>;
    getRefferedUsers(param:string): Promise<any>;
    getDistributorOrders(id:string): Promise<{orders:Order[]} | null>;
    getDistributorOrThrow(id:string):Promise<void>; 
    updateProfile(id:string, profileData:Partial<Distributor>, imageFile:File | null):Promise<DistributorData>;
    getReferralLinks(id:string): { buyerReferralLink: string, distributorReferralLink: string }
}

export interface IDistributorRepository{
    getProfile(id:string):Promise<Distributor | null>;
    updateDistributorCommission(id:string, commission:number):Promise<void>;
    getReferredUsers(id:string):Promise<{referredUsers: ReferredUsers[]}[]>;
    getDistributorOrders(id:string): Promise<{orders:Order[]} | null>;
    getAllDistributors(paginationObject:IPagination):Promise<AllDistributors[]>;
    updateProfile(id:string,profile:Partial<Distributor>):Promise<Distributor>;
    updateDistributorSubscriptionStatus(id:string, status:SubscriptionStatus):Promise<Distributor>;
    getDistributorwithStripeId(id:string):Promise<Distributor|null>;
    getDistributorwithReferralId(id:string):Promise<Distributor|null>;
    getDistributorwithEmail(email:string):Promise<Distributor | null>;
}

export const DTypes = {
    IDistributorRepository: Symbol("IDistributorRepository"),
    IDistributorService: Symbol("IDistributorService")
}