import {Container} from "inversify";
import { IDistributorService, IDistributorRepository, TYPES } from "../modules/distributor/distributor.dtos";
import DistributorRepository from "../modules/distributor/distributor.repository";
import DistributorService from "../modules/distributor/distributor.service";
import AuthRepository from "../modules/auth/auth.repositories";
import AuthService from "../modules/auth/auth.service";
import { ATypes, IAuthRepository, IAuthService } from "../modules/auth/auth.dto";
import { IPrismaClient, PrismaType } from "../utils/db/prisma";
import { PrismaClient } from "@prisma/client";

const container  = new Container();

container.bind<IPrismaClient>(PrismaType.IPrismaClient).to(PrismaClient);
container.bind<IDistributorService>(TYPES.IDistributorService).to(DistributorService);
container.bind<IDistributorRepository>(TYPES.IDistributorRepository).to(DistributorRepository);
container.bind<IAuthRepository>(ATypes.IAuthRepository).to(AuthRepository);
container.bind<IAuthService>(ATypes.IAuthService).to(AuthService);

export default container;
