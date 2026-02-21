import Cloudinary from "../../modules/cloud/cloudinary.service";

export default function uploadImage(imageToUpload:Express.Multer.File){
    const cloudinaryInstance = Cloudinary.getInstance();
    const imageUrl = cloudinaryInstance.uploadImage(imageToUpload.path);
    return imageUrl;
}