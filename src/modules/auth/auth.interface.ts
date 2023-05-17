import { Request } from "express";


export interface AuthRequest extends Request {
    user?: distributorPayload
}

export interface distributorPayload{
    id: string;
    email?: string;
    activeStatus?: boolean;
    fullname?: string;
    type?: string;
}

export interface ISignIn {
    email: string
    password:string
}