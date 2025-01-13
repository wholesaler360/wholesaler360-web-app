import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadFile = async (localFilePath) => {
    try {
        if(!localFilePath)
        {
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : 'auto'

        })
        
        console.log(`File upload on cloudainary src : ${response.url}`);
        // Once file is uploaded we will delete from the localPath
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        // this delete the file from the localStorage 
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async (publicID)=>{
    try {
       const result = await cloudinary.uploader.destroy(publicID)
        console.log("Delete Successfully..");
    } catch (error) {
        console.log("Error deleting the cloudinary files");
    }
}

const deleteFromLocalPath = async(localFilePath) =>{
    if(!localFilePath)
    {
        return null;
    }
    fs.unlinkSync(localFilePath)
}

export {uploadFile,deleteFromCloudinary,deleteFromLocalPath}