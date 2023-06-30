import { prisma } from "../../utils/db/prisma";
import { UpdateAdmin } from "./admin.dtos";

export default class AdminRepository {
    private admin = prisma.admin;

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