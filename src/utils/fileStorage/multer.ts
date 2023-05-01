import multer from "multer"
import {Request} from "express";
import { BadRequestError } from "../../common/error";
import path from "path";
import {unlinkSync} from "fs";
import "express-async-errors";

// This specifies where to put the images locally
const multerStorage= multer.diskStorage({
    destination:( request:Request, file:Express.Multer.File, callback:any)=>{
        callback(null, __dirname);
    },
    
    /* Verifies the image file format is supported */
    filename: (request:Request, file:Express.Multer.File, callback:any)=>{
        const minmetypes = ["image/png", "image/jpeg", "image/jpg"]
        if(!minmetypes.includes(file.mimetype)){
            const filePath = path.join(__dirname, file.originalname)
            try {
              unlinkSync(filePath); 
            }
            catch(err:any){
              callback(new BadRequestError("Image format not supported!"), file.originalname)
            }
            callback(new BadRequestError("Image format not supported!"), file.originalname)
        }
        callback(null, file.originalname);
    }
})

const fileFilter = (req:Request, file:Express.Multer.File, callback:any) => {
    /*Define an array of allowed fields*/
    const allowedFields = ['image', 'driversLicense', 'Passport', 'VotersId', 'NationalIDCard']; // Add the field names you want to allow

    /* Check if the field name of the current file matches any of the allowed fields */
    if(!allowedFields.includes(file.fieldname)){
      // Reject the file
      const filePath = path.join(__dirname, file.originalname)
      try {
        unlinkSync(filePath); 
      }
      catch(err:any){
        callback(new BadRequestError("Image field not expected!"), file.originalname)
      }
      callback(new BadRequestError("Image field not expected!"), file.originalname)
    }
    callback(null, file.originalname);
}

// work on making sure only one file is sent to the backend at any point - might not work on it sha
export const multerUpload = multer({storage: multerStorage, fileFilter});