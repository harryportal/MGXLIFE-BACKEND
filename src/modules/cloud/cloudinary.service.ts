import { v2 as cloudinary } from "cloudinary";
import CloudinaryResponse from "./cloudinary.interface";
import { BadRequestError, InternalServerError } from "../../common/error";
import {unlinkSync} from "fs";
import * as dotenv from "dotenv";


dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default class Cloudinary {
    private static instance: Cloudinary;

    private constructor() {
        // Initialize Cloudinary configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    public static getInstance(): Cloudinary {
        if (!Cloudinary.instance) {
            Cloudinary.instance = new Cloudinary();
        }
        return Cloudinary.instance;
    }

    uploadImage = async (imagetoUpload: string):Promise<CloudinaryResponse> =>{
        try{
            const cloudinaryData = await cloudinary.uploader.upload(
                imagetoUpload, {
                    public_id: process.env.CLOUDINARY_FOLDER_NAME
                }
            )
    
            const {url} = cloudinaryData;
            if (!url){
                unlinkSync(imagetoUpload); // deletes the image from local file path
                throw new BadRequestError("Couldn't upload image, Try again later.")
            }
            unlinkSync(imagetoUpload);
            return {imageUrl: url};

        }catch(error){
            unlinkSync(imagetoUpload);
            throw new InternalServerError(error)
        }
    }   
}
