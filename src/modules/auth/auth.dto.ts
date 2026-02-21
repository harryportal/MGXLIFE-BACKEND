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

export interface IAuthService {
  verifyEmail(verificationToken: string): Promise<void>;
  signIn(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }>;
  resetPassword(token: string, password: string, confirmPassword: string): Promise<void>;
  deleteRefreshToken(refreshToken: string): Promise<void>;
  getAccessToken(refreshToken: string): Promise<string>;
  createDistributor(distributorData: Omit<Distributor, "id">, refferalId: string): Promise<void>;
  sendVerificationMail(firstname: string, email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
}

export const ATypes = {
    IAuthRepository:Symbol("IAuthRepository"),
    IAuthService:Symbol("IAuthService")
}

export type DistributorNoReferral = Omit<Distributor, "id" | "referredById">