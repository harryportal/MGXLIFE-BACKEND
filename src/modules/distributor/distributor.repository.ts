import { NotFoundError } from "../../common/error";
import { prisma } from "../../utils/db/prisma";

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
}