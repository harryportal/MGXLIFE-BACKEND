import { prisma } from "../../utils/db/prisma";
import { UpdateAdmin } from "./admin.dtos";

export default class AdminRepository {
    private admin = prisma.admin;

    public getAdmin = async(id:string)=>{
        const admin = await this.admin.findUnique({
            where: {id}
        });
        return admin;
    };

    public updateAdmin = async(email:string, updateData:UpdateAdmin)=>{
        const {firstName, lastName, imageUrl } = updateData;
        const admin = await this.admin.update({
            where:{ email }, 
            data: {
                firstName, lastName, imageUrl
            }
        })
        const {password, ...updatedAdmin} = admin;
        return updatedAdmin;
    }

}