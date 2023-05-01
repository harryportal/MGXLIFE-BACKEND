import { Request } from "express";


export interface AuthRequest extends Request {
    user?: userPayload
}

export interface userPayload{
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