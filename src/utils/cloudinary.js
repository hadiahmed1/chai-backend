import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (path) => {
    if (!path) return null;
    const uploadResult = await cloudinary.uploader
        .upload( path, {
            resource_type: "auto"
        })
        .catch((error) => {
            console.log("Coudnt upload to cloudinary");
            fs.unlinkSync(path);
            return null;
        });
    fs.unlinkSync(path);
    return uploadResult;
}

export default uploadOnCloudinary;