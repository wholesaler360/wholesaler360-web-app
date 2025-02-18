import { ApiResponse } from "../../../utils/api-Responnse-utils.js";
import { ApiError } from "../../../utils/api-error-utils.js";
import { User } from "../../users/user-model.js";
import { asyncHandler } from "../../../utils/asyncHandler-utils.js";
import { uploadFile, deleteFromLocalPath, deleteFromCloudinary } from "../../../utils/cloudinary-utils.js";

const changePassword = asyncHandler(async(req,res,next)=>{
    console.log("------------------Account Setting Change Password-----------------");
    const {password , newPassword} = req.body;
    const mobileNo = req.fetchedUser.mobileNo;
    if(!password || !newPassword)
    {
        return next(ApiError.validationFailed("Please provide the mobile number and old password and new password"));
    }
    const user = await User.findOne({mobileNo : mobileNo , isUserDeleted : false});
    if(!user)
    {
        return next(ApiError.dataNotFound("User not found"));
    }
    
    
    const isPasswordMatched = await user.isPasswordCorrect(password);
    if(!isPasswordMatched)
    {
        return next(ApiError.validationFailed("Invalid password"));
    }
    
    try {
        user.password = newPassword;
        user.refreshToken = null;
        await user.save();
        const options = {
            httpOnly:true,
            secure : process.env.NODE_ENV === "production",
            sameSite : 'none'
          }
        res.clearCookie('refreshToken',options);
        res.status(200).json(ApiResponse.successRead({message : "Password changed successfully,Please Login again"}));
        console.log("------------------Password Changed Successfully-----------------");
    } catch (error) {
        return next(ApiError.dataNotUpdated("Unable to update the password"));
    }
})

const editProfile = asyncHandler(async(req,res,next)=>{
    console.log("-----------------Edit Profile-----------------");
    const oldMobileNo = req.fetchedUser.mobileNo;
    const oldEmail = req.fetchedUser.email;

    const {name , mobileNo, email} = req.body;
    if(!name || !mobileNo || !email)
    {
        return next(ApiError.validationFailed("Please provide the name and mobile number and email"));
    }
    const condition = [];
    if(oldMobileNo !== mobileNo){
        condition.push({mobileNo : oldMobileNo});
    }

    if(oldEmail !== email){
        condition.push({email : oldEmail});
    }

    
    try {
        if(condition.length > 0){
            const user = await User.countDocuments({$or : condition , isUserDeleted : false});
            if(user)
            {
                return next(ApiError.validationFailed("Mobile number or email already exists"));
            }
        }
        const user = await User.findByIdAndUpdate(req.fetchedUser._id, {name,mobileNo,email},{new:true});
    
        if(!user)
        {
            return next(ApiError.dataNotUpdated("User not found"));
        }
    
        res.status(200).json(ApiResponse.successUpdated({message : "Profile updated successfully"}));
        console.log("-----------------Profile Updated Successfully-----------------");
    } catch (error) {
        console.log(error);
        return next(ApiError.dataNotUpdated("Unable to update the profile"));
    }
    
})

const fetchDetails = asyncHandler(async(req,res,next)=>{
    const name = req.fetchedUser.name;
    const mobileNo = req.fetchedUser.mobileNo;
    const email = req.fetchedUser.email;
    const avatar = req.fetchedUser.avatar;
    const roleName = req.fetchedUser.role.name;

    res.status(200).json(ApiResponse.successRead({name,mobileNo,email,avatar,roleName}));

});

const changeAvatar = asyncHandler(async(req,res,next)=>{
    console.log("-----------------Change User Avatar -----------------");
    const mobileNo = req.fetchedUser.mobileNo;
    const avatar = req.files?.avatar?.[0]?.path;
    try{   
        if(!avatar)
        {
            return next(ApiError.validationFailed("Please provide the avatar"));
        }
        const url = await uploadFile(avatar);
        const oldUrl = req.fetchedUser.avatar;
        const user = await User.findOneAndUpdate({mobileNo : mobileNo , isUserDeleted : false},{avatar : url},{new:true});
        if(oldUrl)
        {
            await deleteFromCloudinary(oldUrl);
        }
        res.status(200).json(ApiResponse.successUpdated( user,"Avatar updated successfully"));
        console.log("-----------------Avatar Updated Successfully-----------------");
    }
    catch(error)
    {
        console.log("Error updating the avatar:", error);
        return next(ApiError.dataNotUpdated("Unable to update the avatar"));
    }
    finally{
        deleteFromLocalPath(avatar);
    }
})

export { changePassword , editProfile, fetchDetails, changeAvatar}