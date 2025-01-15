import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
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
        
        if(!(response.secure_url))
        {   
            console.error(`File not uploaded on cloudainary`);
            fs.unlinkSync(localFilePath)
            return null;
        }
        console.log(`File uploaded on cloudainary src : ${response.secure_url}`);
        
        // Once file is uploaded we will delete from the localPath
        fs.unlinkSync(localFilePath)
        return response.secure_url;

    } catch (error) {
        console.error(`Error uploading file: ${error.message}`);
        fs.unlinkSync(localFilePath)    // Delete file from local temp path
        return null;
    }
}

const deleteFromCloudinary = async (publicID)=>{
    try {
       const result = await cloudinary.uploader.destroy(publicID)
        console.log("Delete Successfully..");
    } catch (error) {
        console.log("Error deleting the cloudinary file");
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
