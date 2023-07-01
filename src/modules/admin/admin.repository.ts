import { inject } from "inversify";
import { IPrismaClient, PrismaType} from "../../utils/db/prisma";
import { IAdminRepository, UpdateAdmin } from "./admin.dtos";

export default class AdminRepository implements IAdminRepository {
    private admin;
    constructor(@inject(PrismaType.IPrismaClient)prisma:IPrismaClient){
        this.admin = prisma.admin;
    }

    public getAdmin = async(email:string)=>{
        console.log(email);
        const admin = await this.admin.findUnique({
            where: {email}
        });
        return admin;
    };

    public updateAdmin = async(id:string, updateData:UpdateAdmin)=>{
        const {firstName, lastName, imageUrl } = updateData;
        const admin = await this.admin.update({
            where:{ id }, 
            data: {
                firstName, lastName, imageUrl
            }
        })
        const {password, ...updatedAdmin} = admin;
        return updatedAdmin;
    }

}