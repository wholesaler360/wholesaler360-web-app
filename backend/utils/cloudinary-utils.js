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
        console.log(`Error uploading file: ${error.message}`);
        fs.unlinkSync(localFilePath)    // Delete file from local temp path
        return null;
    }
}

const deleteFromCloudinary = async (publicID)=>{
    try {
        // We need to extract the publicID from the URL inorder to delete the file from cloudinary
        // e.g https://res.cloudinary.com/ddfgsdg/image/upload/v163sdfg/sgdsfgsdgsdg.jpg
        // publicID = sgdsfgsdgsdg.jpg
        const publicIDForDelete = publicID.split('/').slice(-1)[0].split('.')[0];

        console.log(`Deleting file from cloudinary with publicID : ${publicIDForDelete}`);
       const result = await cloudinary.uploader.destroy(publicIDForDelete)
       if (result.result === 'ok') {
           console.log("Delete Successfully..");
       } else {
           console.log("Failed to delete the file from cloudinary");
       }
    } catch (error) {
        console.log("Error deleting the cloudinary file");
    }
}

const deleteFromLocalPath = async(localFilePath) =>{
    if(fs.existsSync(localFilePath) === false)
    {
        return ;
    }
    fs.unlinkSync(localFilePath)
}

export {uploadFile,deleteFromCloudinary,deleteFromLocalPath}
