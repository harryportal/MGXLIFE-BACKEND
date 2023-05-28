import { NotFoundError } from "../../common/error";
import DistributorRepository from "./distributor.repository";

export default class DistributorService {
    private distributorRepository;
    constructor(){
        this.distributorRepository =  new DistributorRepository();
    }

    public getDistributor = async(distributorId:string)=>{
        const distributor = await this.distributorRepository.getProfile(distributorId);
        if(!distributor) { throw new NotFoundError("No Distributor with Id Found!")};
    }
}