import {Container} from "inversify";
import { IDistributorService, IDistributorRepository, TYPES } from "../modules/distributor/distributor.dtos";
import DistributorRepository from "../modules/distributor/distributor.repository";
import DistributorService from "../modules/distributor/distributor.service";

const container  = new Container();

container.bind<IDistributorService>(TYPES.IDistributorService).to(DistributorService);
container.bind<IDistributorRepository>(TYPES.IDistributorRepository).to(DistributorRepository);


export default container;
