import { UserRepository } from "./user.repository";
import { userPayload } from "../auth/auth.interface";
import { AuthRequest } from "../auth/auth.interface";
import { Response } from "express";
import ListingRepository from "../lisiting/lisiting.repository";
import Cloudinary from "../cloud/cloudinary.service";
import CompressImage from "../../utils/fileStorage/compressImage";



export default class UserController {
    private static userRepository = new UserRepository();
    private static listingRepository = new ListingRepository();
    private static cloudinaryService = new Cloudinary();

    static getProfile = async(req:AuthRequest, res:Response)=>{
        const {id} = req.user as userPayload;
        const profile = await this.userRepository.getProfile(id);
        res.json({success:true, data:profile});
    }

    /* Logic for uploading the image */
    private static uploadImage = async(imagepath:string)=>{
        if (!imagepath) { return "" };
        const { imageUrl } = await this.cloudinaryService.uploadImage(imagepath); 
        return imageUrl;
    }

    static addKYC = async(req:AuthRequest, res:Response)=>{
        const files = req.files as Array<Express.Multer.File>
        const file = files[0];
        const userId = req.user!.id;
        const fieldname = file.fieldname;
        const imageUrl = await this.uploadImage(file.path) as string;
        const updatedKyc = await this.userRepository.updateKYC(imageUrl, userId, fieldname)
        res.status(201).json({success:true, data:updatedKyc})
    }

    static updateProfile = async(req:AuthRequest, res:Response)=>{
        const {id} = req.user as userPayload;
        const profileData = req.body;

        // convert the types to match types in database
        const {financeRequired, dealSizeMax, dealSizeMin, businessNo} = profileData;
        profileData.financeRequired = Boolean(financeRequired);
        profileData.dealSizeMax = Number(dealSizeMax);
        profileData.dealSizeMin = Number(dealSizeMin);
        profileData.businessNo = Number(businessNo);

        const file = await CompressImage(req.file);
        const imageUrl = await this.uploadImage(file.path);
        if (imageUrl) { profileData.imageUrl = imageUrl; }

        const updatedProfile = await this.userRepository.updateProfile(id, profileData);
        res.json({success:true, data:{updatedProfile}})
    }

    static subscribeforUpdates = async(req:AuthRequest, res:Response)=>{
        const {id} = req.user as userPayload;
        await this.userRepository.subscribeforUpdates(id);
        return res.json({success:true})
    }

    static profilewithListingCount = async(req:AuthRequest, res:Response)=>{
        const { id } = req.user as userPayload;
        const profile = await this.userRepository.getProfile(id); // returns the user profile
        const [lisitingCount, watchedListingCount] = await this.listingRepository.getListingCount(id);

        res.json({success:true, data:{profile, lisitingCount, watchedListingCount }})
    }
}