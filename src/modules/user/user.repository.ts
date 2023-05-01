import { NotFoundError } from "../../common/error";
import { prisma } from "../../utils/db/prisma";
import { Profile } from "@prisma/client";


export class UserRepository {
    private user;
    private profile;
    private kyc;
    constructor(){
        this.user = prisma.user;
        this.profile = prisma.profile;
        this.kyc  = prisma.kyc;
    }

    public updateKYC = async (imageUrl: string, userId: string, fieldname: string) => {
        const updatedData = { [fieldname]: imageUrl };
      
        const updateKyc = await this.kyc.upsert({
          where: { userId },
          create: {...updatedData,  user: { connect: { id: userId } }},
          update: { ...updatedData }
        });
      
        return updateKyc;
      }

    public getProfile = async(userId:string)=>{
        const user = await this.user.findFirst({
            where: { id: userId },select:{
                id:true, fullname:true, company:true, email:true, contact:true, verified: true, referal: true, purpose: true,
                subscription: true, profile:true
            }})
        return user;
    }
    
    public subscribeforUpdates = async(userId:string)=>{
        // simply sets the subscription field of the user model to be true
        const user = await this.user.update({
            where: {  id: userId  }, data: { subscription: true }
        })
        return user;
    };

    public updateProfile = async(userId:string, profileData: Omit<Profile, "id">)=>{
        const {category, businessNo, businessCategory, businessModel, 
            dealSizeMin, dealSizeMax, financeRequired, aboutCompany,imageUrl } = profileData;
        const udpatedProfile = await this.profile.update({
            where:{userId},
            data:{
                category, businessNo, businessCategory, businessModel, dealSizeMax, dealSizeMin, financeRequired, 
                aboutCompany, imageUrl
            }
        });
        if(!udpatedProfile) { throw new NotFoundError("No profile associated with ID")}
        return udpatedProfile;
    }

}