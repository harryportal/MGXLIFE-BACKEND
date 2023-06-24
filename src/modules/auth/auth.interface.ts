import { Request } from "express";
import { Distributor } from "@prisma/client";


export interface AuthRequest extends Request {
    user?: jwtPayload
}

export interface jwtPayload{
    id: string;
    email: string;
    refferalId:string
    activeStatus: boolean;
    firstname: string;
    lastname: string;
    type: string;
}

export interface ISignIn {
    email: string
    password:string
}

export type DistributorwithoutReferral = Omit<Distributor, "id" | "referredById">