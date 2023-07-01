import { Request } from "express";
import { Distributor, RefreshToken } from "@prisma/client";


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

export interface IAuthRepository {
    getDistributor(email:string):Promise<Distributor | null>;
    verifyDistributor(email:string):Promise<void>;
    createDistributorwithReferral(distributor:DistributorNoReferral,refferedById:string):Promise<Distributor>
    createDistributorwithoutReferral(distributor:DistributorNoReferral):Promise<Distributor>;
    getDistributorwithReferalId(referringId:string):Promise<Distributor | null>;
    getRefreshToken(refreshToken:string):Promise<RefreshToken | null>
    deleteRefreshToken(refreshToken:string):Promise<void>;
    resetPassword(distributorId:string, password:string):Promise<void>;
    createRefreshToken(refreshToken:string, expiresAt:Date, distributorId:string):Promise<void>;
}

export type DistributorNoReferral = Omit<Distributor, "id" | "referredById">