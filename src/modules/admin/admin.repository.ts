import { prisma } from "../../utils/db/prisma";

export default class AdminRepository {
    private admin = prisma.admin;

    public getAdmin = async(email:string)=>{
        const admin = await this.admin.findUnique({
            where: {email}
        });
        return admin;
    };
}