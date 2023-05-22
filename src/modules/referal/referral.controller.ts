import { AuthRequest } from "../auth/auth.interface";
import { Response } from "express";


export default class referralController {
    static createProduct = (req:AuthRequest, res:Response)=>{
        return res.status(200);
    }
}